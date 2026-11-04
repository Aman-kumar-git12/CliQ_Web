/** Generate Reply results: loading / error / empty states, context + AI understanding, and the reply suggestion cards. */
import { Sparkles, Bot, Brain, Wand2, History, MessageSquarePlus } from "lucide-react";
import { deriveAIAssistantReplies } from "../../utils/aiAssistantReplies";
import SectionCard from "./AIAssistantSectionCard";
import SectionLabel from "./AIAssistantSectionLabel";
import AIAssistantReplyCard from "./AIAssistantReplyCard";

export default function AIAssistantReplyResults({
    replyData,
    replyLoading,
    error,
    selectedTone,
    onGenerateReplies,
    onUseReply,
    onSendReply,
}) {
    const { rewrites, emojiRepliesWith, emojiRepliesWithout, groupedReplies, aiUnderstandingParagraph } =
        deriveAIAssistantReplies(replyData);

    const renderReplyCard = (text, key, { highlighted = false, label = "" } = {}) => (
        <AIAssistantReplyCard
            key={key}
            text={text}
            highlighted={highlighted}
            label={label}
            onUseReply={onUseReply}
            onSendReply={onSendReply}
        />
    );

    return (
        <>
            {replyLoading && (
                <SectionCard className="motion-safe:animate-pulse space-y-4 border-brand/20 bg-brand/[0.02]">
                    <div className="h-3 w-24 rounded bg-brand/20" />
                    <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded bg-white/10" />
                        <div className="h-4 w-full rounded bg-white/[0.06]" />
                        <div className="h-4 w-5/6 rounded bg-white/[0.06]" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <div className="h-8 w-16 rounded-full bg-white/[0.06]" />
                        <div className="h-8 w-24 rounded-full bg-emerald-500/10" />
                    </div>
                </SectionCard>
            )}

            {!replyLoading && error && (
                <SectionCard className="border-red-500/20 bg-red-500/10 space-y-4">
                    <div>
                        <SectionLabel className="text-red-300">Reply Generator Unavailable</SectionLabel>
                        <p className="mt-1 text-[13px] leading-relaxed text-red-200">{error}</p>
                    </div>
                    <button
                        onClick={() => onGenerateReplies?.()}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition duration-150 ease-soft hover:bg-white/15 active:scale-95 focus-ring"
                    >
                        <Wand2 size={14} />
                        Try Again
                    </button>
                </SectionCard>
            )}

            {!replyLoading && !error && !replyData?.top_reply && !replyData?.reply_suggestions?.length && (
                <SectionCard className="flex flex-col items-center justify-center p-8 text-center border-dashed border-line bg-transparent">
                    <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                        <Bot size={32} className="text-brand-light" />
                    </div>
                    <h4 className="text-[15px] font-bold text-white tracking-wide mb-2">Ready to assist</h4>
                    <p className="text-[13px] text-neutral-400 max-w-[240px] leading-relaxed">
                        Choose a tone and tap <span className="font-semibold text-white">Generate</span> to create smart
                        message suggestions.
                    </p>
                </SectionCard>
            )}

            {!replyLoading &&
                !error &&
                (replyData?.context_preview || aiUnderstandingParagraph || replyData?.last_other_message) && (
                    <div className="grid gap-3 md:grid-cols-2">
                        <SectionCard>
                            <SectionLabel icon={History}>Actual Context</SectionLabel>
                            {replyData?.context_preview ? (
                                <div className="rounded-xl bg-black/20 p-3 border border-line-soft">
                                    <pre className="whitespace-pre-wrap text-[13px] text-neutral-300 font-sans leading-relaxed">
                                        {replyData.context_preview}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-[13px] text-ink-300 italic">No recent chat context.</p>
                            )}
                            {replyData?.last_other_message && (
                                <div className="mt-3 rounded-xl border border-brand/10 bg-brand/[0.02] p-3">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/70 font-bold mb-1.5">
                                        Last Message
                                    </p>
                                    <p className="text-[13px] text-neutral-200">{replyData.last_other_message}</p>
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard>
                            <SectionLabel icon={Brain}>AI Understanding</SectionLabel>
                            <p className="text-[13.5px] leading-relaxed text-neutral-300">
                                {aiUnderstandingParagraph ||
                                    "The assistant is still forming an interpretation of the conversation context."}
                            </p>
                            {replyData?.detected_intent && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <div className="rounded-md bg-white/[0.04] border border-line-soft px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                                        <span className="text-ink-300">Intent: </span>
                                        <span className="text-pink-300">{replyData.detected_intent}</span>
                                    </div>
                                    <div className="rounded-md bg-white/[0.04] border border-line-soft px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                                        <span className="text-ink-300">Tone: </span>
                                        <span className="text-violet-300">{replyData.tone || selectedTone}</span>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}

            {!replyLoading && !error && replyData?.safety_message && (
                <SectionCard className="border-amber-500/20 bg-amber-500/10">
                    <SectionLabel className="text-amber-400">Safety Notice</SectionLabel>
                    <p className="text-[13px] leading-relaxed text-amber-200/90">{replyData.safety_message}</p>
                </SectionCard>
            )}

            {!replyLoading && !error && replyData?.top_reply && (
                <SectionCard>
                    <SectionLabel icon={Sparkles} className="!text-brand-light">
                        Top Recommendation
                    </SectionLabel>
                    {renderReplyCard(replyData.top_reply, "top-reply", { highlighted: true })}
                </SectionCard>
            )}

            {!replyLoading && !error && groupedReplies.length > 0 && (
                <SectionCard>
                    <SectionLabel icon={MessageSquarePlus}>Categorized Options</SectionLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {groupedReplies.map((item) => renderReplyCard(item.value, item.label, { label: item.label }))}
                    </div>
                </SectionCard>
            )}

            {!replyLoading && !error && replyData?.reply_suggestions?.length > 0 && (
                <SectionCard>
                    <SectionLabel icon={Wand2}>More Suggestions</SectionLabel>
                    <div className="grid gap-2">
                        {replyData.reply_suggestions.map((item, index) => renderReplyCard(item, `suggestion-${index}`))}
                    </div>
                </SectionCard>
            )}

            {!replyLoading && !error && emojiRepliesWith.length > 0 && (
                <SectionCard>
                    <SectionLabel className="!text-pink-300">With Emojis</SectionLabel>
                    <div className="grid gap-2">
                        {emojiRepliesWith.map((item, index) => renderReplyCard(item, `emoji-with-${index}`))}
                    </div>
                </SectionCard>
            )}

            {!replyLoading && !error && emojiRepliesWithout.length > 0 && (
                <SectionCard>
                    <SectionLabel>Without Emojis</SectionLabel>
                    <div className="grid gap-2">
                        {emojiRepliesWithout.map((item, index) => renderReplyCard(item, `emoji-without-${index}`))}
                    </div>
                </SectionCard>
            )}

            {!replyLoading && !error && rewrites.length > 0 && (
                <SectionCard>
                    <SectionLabel>Rewrite Options</SectionLabel>
                    <div className="grid gap-2">
                        {rewrites.map((item, index) => renderReplyCard(item, `rewrite-${index}`))}
                    </div>
                </SectionCard>
            )}
        </>
    );
}

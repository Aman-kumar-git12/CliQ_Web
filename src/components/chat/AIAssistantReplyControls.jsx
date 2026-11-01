/** Generate Reply controls: tone dropdown, emoji preference switch and the "Generate Smart Replies" button. */
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2, MessageSquarePlus, Smile, ChevronDown } from "lucide-react";
import { AI_ASSISTANT_TONES as tones } from "./aiAssistantConstants";
import SectionLabel from "./AIAssistantSectionLabel";

export default function AIAssistantReplyControls({
    selectedTone,
    onToneChange,
    toneDropdownOpen,
    setToneDropdownOpen,
    emojiPreference,
    onEmojiPreferenceChange,
    onGenerateReplies,
    replyLoading,
}) {
    return (
        <>
            <div className="space-y-2 px-1 relative z-20">
                <SectionLabel icon={MessageSquarePlus} className="!mb-0">
                    Tone Selection
                </SectionLabel>

                <div className="relative">
                    <button
                        onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                        className="w-full flex items-center justify-between bg-surface-900 border border-white/5 rounded-xl px-4 py-2.5 transition-colors hover:border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[16px]">
                                {tones.find((t) => t.key === selectedTone)?.emoji || "😎"}
                            </span>
                            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-violet-200">
                                {selectedTone}
                            </span>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-neutral-400 transition-transform duration-300 ${toneDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    <AnimatePresence>
                        {toneDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1 grid grid-cols-2 gap-1 max-h-[180px] overflow-y-auto scrollbar-hide"
                            >
                                {tones.map(({ key, emoji }) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            onToneChange?.(key);
                                            setToneDropdownOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                            selectedTone === key
                                                ? "bg-violet-600/20 text-violet-200"
                                                : "hover:bg-white/5 text-neutral-400 hover:text-white"
                                        }`}
                                    >
                                        <span className="text-[15px]">{emoji}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{key}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-2 px-1">
                <SectionLabel icon={Smile} className="!mb-0">
                    Emoji Preference
                </SectionLabel>
                <div className="flex bg-surface-900 rounded-xl p-1 border border-white/5 relative isolate overflow-hidden">
                    <motion.div
                        className="absolute inset-y-1 rounded-lg bg-violet-600/30 border border-violet-500/30 -z-10"
                        initial={false}
                        animate={{
                            left:
                                emojiPreference === "both"
                                    ? "0.25rem"
                                    : emojiPreference === "with"
                                      ? "33.33%"
                                      : "66.66%",
                            width: "calc(33.33% - 0.25rem)",
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    {[
                        { key: "both", label: "Balanced", icon: null },
                        {
                            key: "with",
                            label: "More Emoji",
                            icon: <Smile size={14} className="mb-0.5" />,
                        },
                        { key: "without", label: "No Emoji", icon: null },
                    ].map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => onEmojiPreferenceChange?.(opt.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                                emojiPreference === opt.key
                                    ? "text-violet-200"
                                    : "text-neutral-500 hover:text-neutral-300"
                            }`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-1">
                <button
                    onClick={() => onGenerateReplies?.()}
                    disabled={replyLoading}
                    className="relative w-full overflow-hidden rounded-2xl group transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-600 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-[0.05]" />
                    <div className="relative px-6 py-3 flex items-center justify-center gap-3">
                        {replyLoading ? (
                            <Loader2 size={18} className="animate-spin text-white" />
                        ) : (
                            <Wand2 size={18} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        )}
                        <span className="text-[14px] font-bold tracking-wide text-white drop-shadow-md">
                            {replyLoading ? "Generating Magic..." : "Generate Smart Replies"}
                        </span>
                    </div>
                </button>
            </div>
        </>
    );
}

/** One chatbot message bubble: user text, an AI quick-guide card, or AI markdown (with error banner). */
import { Sparkles, Clock, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { parseStructuredSteps, markdownComponents } from "../../utils/aiUtils";
import { ERROR_LABELS, formatRetryTime } from "./constants";

export default function ChatbotMessageBubble({ msg }) {
    const parsedStep = msg.role === "ai" && !msg.error ? parseStructuredSteps(msg.text) : null;

    return (
        <div
            className={`max-w-full rounded-[18px] text-[13.5px] leading-relaxed break-words ${
                msg.role === "user"
                    ? "px-3.5 py-2.5 bg-brand text-white rounded-tr-md shadow-md shadow-brand/20"
                    : msg.error
                      ? "p-3 bg-amber-500/10 border border-amber-400/25 text-amber-100 rounded-tl-md whitespace-pre-wrap"
                      : "p-3 bg-white/[0.04] border border-line-soft text-neutral-300 rounded-tl-md whitespace-pre-wrap"
            }`}
            role={msg.error ? "alert" : undefined}
        >
            {msg.error && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                    {["daily_limit", "busy"].includes(msg.error.kind) ? (
                        <Clock size={12} />
                    ) : (
                        <AlertTriangle size={12} />
                    )}
                    {ERROR_LABELS[msg.error.kind] || "Something went wrong"}
                </div>
            )}
            {msg.role === "user" ? (
                msg.text
            ) : parsedStep ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-brand/[0.08] border border-brand-light/10 p-3">
                        <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand-light/15 flex items-center justify-center shrink-0">
                            <Sparkles size={14} className="text-violet-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300/75 font-semibold mb-1">
                                Quick Guide
                            </p>
                            <p className="text-white font-semibold text-[13.5px] leading-snug">{parsedStep.title}</p>
                        </div>
                    </div>
                    <ul className="flex flex-col gap-2 mt-0.5">
                        {parsedStep.steps.map((step, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-line-soft px-3 py-2.5"
                            >
                                <span className="min-w-[24px] h-6 rounded-full bg-brand/15 text-violet-200 text-[11px] font-semibold flex items-center justify-center border border-brand-light/10">
                                    {i + 1}
                                </span>
                                <span className="text-neutral-200 text-[13px] leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="max-w-none text-[13.5px]">
                    <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                </div>
            )}
            {msg.error?.retryAt > Date.now() && (
                <p className="mt-2 text-[11px] text-amber-300/80">
                    Available again around {formatRetryTime(msg.error.retryAt)}
                </p>
            )}
        </div>
    );
}

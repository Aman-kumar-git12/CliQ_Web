/** Actions under an AI answer: copy, regenerate, thumbs up/down, thank-you note and "what was wrong" form. */
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { actionButtonClass } from "./constants";

export default function ChatbotMessageActions({
    msg,
    isAnswer,
    isLast,
    isCopied,
    feedbackThanks,
    feedbackNote,
    onCopy,
    onRegenerate,
    onFeedback,
    onFeedbackNoteChange,
    onSubmitFeedbackNote,
}) {
    return (
        <>
            <div className="flex items-center gap-0.5 mt-1 px-1">
                {msg.stopped && <span className="text-[11px] text-ink-300 mr-1.5">Stopped</span>}
                <button
                    type="button"
                    onClick={() => onCopy(msg)}
                    className={actionButtonClass}
                    aria-label="Copy answer"
                    title="Copy"
                >
                    {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                {isAnswer && isLast && (
                    <button
                        type="button"
                        onClick={onRegenerate}
                        className={actionButtonClass}
                        aria-label="Regenerate answer"
                        title="Regenerate"
                    >
                        <RotateCcw size={13} />
                    </button>
                )}
                {isAnswer && msg.dbId && !msg.error && (
                    <>
                        <button
                            type="button"
                            onClick={() => onFeedback(msg, 1)}
                            className={`${actionButtonClass} ${msg.feedback === 1 ? "text-emerald-400 hover:text-emerald-300" : ""}`}
                            aria-label="Helpful"
                            aria-pressed={msg.feedback === 1}
                            title="Helpful"
                        >
                            <ThumbsUp size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onFeedback(msg, -1)}
                            className={`${actionButtonClass} ${msg.feedback === -1 ? "text-rose-400 hover:text-rose-300" : ""}`}
                            aria-label="Not helpful"
                            aria-pressed={msg.feedback === -1}
                            title="Not helpful"
                        >
                            <ThumbsDown size={13} />
                        </button>
                    </>
                )}
            </div>
            {feedbackThanks.id === msg.id && (
                <p role="status" className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-emerald-400">
                    <Check size={12} />
                    {feedbackThanks.text}
                </p>
            )}
            {feedbackNote.id === msg.id && (
                <form onSubmit={(e) => onSubmitFeedbackNote(e, msg)} className="flex items-center gap-2 mt-1 px-1">
                    <input
                        autoFocus
                        value={feedbackNote.text}
                        maxLength={500}
                        onChange={(e) =>
                            onFeedbackNoteChange({
                                id: msg.id,
                                text: e.target.value,
                            })
                        }
                        placeholder="What was wrong? (optional)"
                        aria-label="What was wrong? (optional)"
                        className="flex-1 min-w-0 bg-white/[0.04] border border-line text-neutral-200 text-[16px] md:text-[12px] rounded-full px-3 py-1.5 outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-[border-color,box-shadow] duration-150 ease-soft placeholder:text-ink-300"
                    />
                    <button
                        type="submit"
                        className="text-[12px] text-violet-300 hover:text-violet-200 px-2 py-1 rounded-full transition-colors duration-150 focus-ring"
                    >
                        Send
                    </button>
                </form>
            )}
        </>
    );
}

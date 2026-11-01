/** Ask AI composer: auto-focused textarea (Enter sends, Shift+Enter newline) with send button and context hint. */
import { Loader2, Info, SendHorizontal } from "lucide-react";

export default function AIAssistantComposer({ inputRef, inputValue, onInputChange, onSubmit, isLoading }) {
    return (
        <div className="sticky bottom-0 z-20 px-6 py-4 border-t border-white/5 bg-surface-900/95 backdrop-blur-xl space-y-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-3 py-2 flex items-end gap-2">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => onInputChange?.(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit?.();
                        }
                    }}
                    placeholder="Ask Message AI about this conversation..."
                    aria-label="Ask Message AI about this conversation"
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-[14px] text-white outline-none placeholder-neutral-500 max-h-32 scrollbar-hide"
                />
                <button
                    onClick={() => onSubmit?.()}
                    disabled={isLoading || !inputValue.trim()}
                    className="rounded-full bg-violet-600 p-3 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send"
                    aria-label="Send"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
            </div>
            <div className="flex items-center gap-3 text-neutral-500 text-[11px] px-1">
                <Info size={12} />
                <span>
                    Answers usually use this chat context, but general messaging questions may get broader guidance.
                </span>
            </div>
        </div>
    );
}

/** Ask AI composer: auto-focused textarea (Enter sends, Shift+Enter newline) with send button and context hint. */
import { Loader2, Info, SendHorizontal } from "lucide-react";

export default function AIAssistantComposer({ inputRef, inputValue, onInputChange, onSubmit, isLoading }) {
    return (
        <div className="sticky bottom-0 z-20 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-line-soft bg-surface-900/95 backdrop-blur-xl space-y-3">
            <div className="rounded-[24px] border border-line bg-white/[0.03] px-3 py-2 flex items-end gap-2 transition-[border-color,box-shadow,background-color] duration-200 ease-soft focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10 focus-within:bg-white/[0.05]">
                <textarea
                    ref={inputRef}
                    rows={1}
                    maxLength={4000}
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
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-[16px] md:text-[14px] leading-relaxed text-white outline-none placeholder:text-ink-300 max-h-32 scrollbar-hide"
                />
                <button
                    onClick={() => onSubmit?.()}
                    disabled={isLoading || !inputValue.trim()}
                    className="rounded-full bg-brand p-3 text-white shadow-glow transition duration-150 ease-soft hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 focus-ring"
                    title="Send"
                    aria-label="Send"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
            </div>
            <div className="flex items-start gap-2 text-neutral-400 text-[11px] leading-relaxed px-1">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>
                    Answers usually use this chat context, but general messaging questions may get broader guidance.
                </span>
            </div>
        </div>
    );
}

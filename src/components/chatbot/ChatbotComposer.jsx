/** Chatbot input bar: question field with a send button, or a stop button while an answer streams. */
import { Send, Square } from "lucide-react";

export default function ChatbotComposer({ query, onQueryChange, onSubmit, isBusy, onStop }) {
    return (
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-line-soft bg-surface-900">
            <form onSubmit={onSubmit} className="flex items-center gap-2 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Ask me anything..."
                    aria-label="Ask the AI assistant"
                    className="w-full bg-white/[0.04] border border-line text-white text-[16px] md:text-sm rounded-full pl-4 pr-12 py-3 outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10 focus:bg-white/[0.06] transition-[border-color,box-shadow,background-color] duration-200 ease-soft placeholder:text-ink-300"
                />
                {isBusy ? (
                    <button
                        type="button"
                        onClick={onStop}
                        aria-label="Stop generating"
                        title="Stop"
                        className="absolute right-1.5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-line-strong text-white flex items-center justify-center transition duration-150 ease-soft active:scale-95 focus-ring"
                    >
                        <Square size={12} fill="currentColor" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!query.trim()}
                        aria-label="Send"
                        className="absolute right-1.5 w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-glow transition duration-150 ease-soft hover:brightness-110 active:scale-95 disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 focus-ring"
                    >
                        <Send size={14} className="ml-0.5" />
                    </button>
                )}
            </form>
        </div>
    );
}

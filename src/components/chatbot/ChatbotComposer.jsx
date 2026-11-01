/** Chatbot input bar: question field with a send button, or a stop button while an answer streams. */
import { Send, Square } from "lucide-react";

export default function ChatbotComposer({ query, onQueryChange, onSubmit, isBusy, onStop }) {
    return (
        <div className="p-3 border-t border-white/10 bg-surface-900">
            <form onSubmit={onSubmit} className="flex items-center gap-2 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Ask me anything..."
                    aria-label="Ask the AI assistant"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-full pl-4 pr-12 py-3 outline-none focus:border-violet-500/50 transition-colors placeholder:text-neutral-500"
                />
                {isBusy ? (
                    <button
                        type="button"
                        onClick={onStop}
                        aria-label="Stop generating"
                        title="Stop"
                        className="absolute right-1.5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all"
                    >
                        <Square size={12} fill="currentColor" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!query.trim()}
                        aria-label="Send"
                        className="absolute right-1.5 w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-neutral-800 transition-all hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                        <Send size={14} className="ml-0.5" />
                    </button>
                )}
            </form>
        </div>
    );
}

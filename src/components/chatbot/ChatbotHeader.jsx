/** Chatbot panel header: history toggle, title, expand/collapse and close buttons. */
import { X, Bot, Menu, Maximize2, Minimize2 } from "lucide-react";

export default function ChatbotHeader({ showSidebar, onToggleSidebar, isExpanded, onToggleExpanded, onClose }) {
    return (
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label={showSidebar ? "Back to chat" : "Show chat history"}
                    aria-expanded={showSidebar}
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                >
                    <Menu size={16} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                        <Bot size={18} className="text-violet-400" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">
                        {showSidebar ? "Chat History" : "AI Assistant"}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onToggleExpanded}
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                    aria-label={isExpanded ? "Collapse chatbot" : "Expand chatbot"}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? <Minimize2 size={16} strokeWidth={2.2} /> : <Maximize2 size={16} strokeWidth={2.2} />}
                </button>
                <button
                    type="button"
                    aria-label="Close chatbot"
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

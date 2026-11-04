/** Chatbot panel header: history toggle, title, expand/collapse and close buttons. */
import { X, Bot, Menu, Maximize2, Minimize2 } from "lucide-react";

export default function ChatbotHeader({ showSidebar, onToggleSidebar, isExpanded, onToggleExpanded, onClose }) {
    return (
        <div className="p-4 border-b border-line-soft flex justify-between items-center bg-gradient-to-r from-brand/[0.14] to-brand-pink/[0.08]">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label={showSidebar ? "Back to chat" : "Show chat history"}
                    aria-expanded={showSidebar}
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors duration-150 ease-soft focus-ring"
                >
                    <Menu size={16} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center border border-brand/25">
                        <Bot size={18} className="text-brand-light" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">
                        {showSidebar ? "Chat History" : "AI Assistant"}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={onToggleExpanded}
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors duration-150 ease-soft focus-ring"
                    aria-label={isExpanded ? "Collapse chatbot" : "Expand chatbot"}
                    title={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? <Minimize2 size={16} strokeWidth={2.2} /> : <Maximize2 size={16} strokeWidth={2.2} />}
                </button>
                <button
                    type="button"
                    aria-label="Close chatbot"
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors duration-150 ease-soft focus-ring"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

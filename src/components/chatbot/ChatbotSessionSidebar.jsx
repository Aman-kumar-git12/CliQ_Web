/** Chatbot history view: new chat button, list of past sessions and "clear all" action. */
import { PlusCircle, Trash2, MessageSquare } from "lucide-react";
import ChatbotSkeletonSession from "./ChatbotSkeletonSession";

export default function ChatbotSessionSidebar({
    sessions,
    activeSessionId,
    isHistoryLoading,
    onCreateNewChat,
    onSelectSession,
    onRequestDelete,
    onRequestDeleteAll,
}) {
    return (
        <div className="flex-1 flex flex-col bg-[#0d0d12] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                <button
                    onClick={onCreateNewChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors mb-2"
                >
                    <PlusCircle size={16} />
                    New Chat
                </button>

                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
                        {isHistoryLoading ? (
                            <ChatbotSkeletonSession />
                        ) : (
                            <>
                                <MessageSquare size={24} className="opacity-50" />
                                <span className="text-sm">No recent chats</span>
                            </>
                        )}
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            // Holds the delete button, so it can't be a <button> itself
                            role="button"
                            tabIndex={0}
                            aria-current={activeSessionId === session.id ? "true" : undefined}
                            onClick={() => onSelectSession(session.id)}
                            onKeyDown={(e) => {
                                if (e.target !== e.currentTarget) return;
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelectSession(session.id);
                                }
                            }}
                            className={`group w-full text-left px-3 py-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                activeSessionId === session.id
                                    ? "bg-white/10 border-white/20"
                                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                            }`}
                        >
                            <div className="flex flex-col truncate pr-2">
                                <span className="text-sm text-neutral-200 font-medium truncate">{session.title}</span>
                                <span className="text-[10px] text-neutral-500 mt-0.5">
                                    {new Date(session.updatedAt).toLocaleString([], {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    })}
                                </span>
                            </div>
                            <button
                                type="button"
                                aria-label={`Delete chat "${session.title}"`}
                                onClick={(e) => onRequestDelete(e, session.id)}
                                className="p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            {sessions.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-surface-900">
                    <button
                        onClick={onRequestDeleteAll}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 size={16} />
                        Clear All History
                    </button>
                </div>
            )}
        </div>
    );
}

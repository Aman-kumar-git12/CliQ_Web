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
        <div className="flex-1 flex flex-col bg-surface-800 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 flex flex-col gap-2">
                <button
                    onClick={onCreateNewChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand/15 hover:bg-brand/25 border border-brand/25 text-violet-200 text-sm font-medium flex items-center justify-center gap-2 transition duration-150 ease-soft active:scale-[0.98] mb-2 focus-ring"
                >
                    <PlusCircle size={16} />
                    New Chat
                </button>

                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-ink-300 gap-2">
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
                            className={`group w-full text-left px-3 py-3 rounded-xl border flex items-center justify-between transition-colors duration-150 ease-soft cursor-pointer focus-ring ${
                                activeSessionId === session.id
                                    ? "bg-brand/10 border-brand/25"
                                    : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-line"
                            }`}
                        >
                            <div className="flex flex-col truncate pr-2">
                                <span className="text-sm text-neutral-200 font-medium truncate">{session.title}</span>
                                <span className="text-[10px] text-ink-300 mt-0.5">
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
                                className="p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition duration-150 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            {sessions.length > 0 && (
                <div className="p-3 border-t border-line-soft bg-surface-900">
                    <button
                        onClick={onRequestDeleteAll}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/[0.18] border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition duration-150 ease-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                    >
                        <Trash2 size={16} />
                        Clear All History
                    </button>
                </div>
            )}
        </div>
    );
}

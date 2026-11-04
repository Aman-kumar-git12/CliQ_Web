/** AI assistant history view: Ask AI conversations or generated-reply history, with delete / clear actions. */
import { Bot, Trash2, MessageSquarePlus } from "lucide-react";

// Enter/Space activate a role="button" element (used where a real <button> would nest another button)
const activateOnKey = (handler) => (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
    }
};

export default function AIAssistantHistoryPanel({
    mode,
    askHistory,
    history,
    onRequestConfirm,
    onHideHistory,
    onNewAskChat,
    onContinueAskHistory,
}) {
    return (
        <>
            <div className="flex items-center justify-between border-b border-line pb-3">
                <h4 className="text-sm font-bold text-white tracking-wide">
                    {mode === "ask" ? "Ask AI History" : "Reply History"}
                </h4>
                <button
                    onClick={() => onRequestConfirm({ type: mode === "ask" ? "clear_ask" : "clear_reply", id: null })}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-200 transition duration-150 ease-soft hover:bg-red-500/15 active:scale-95 focus-ring"
                >
                    Clear History
                </button>
            </div>

            {mode === "ask" && (
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => {
                            onNewAskChat?.();
                            onHideHistory();
                        }}
                        className="group w-full text-left flex items-center gap-4 px-4 h-[52px] rounded-[16px] bg-ios-gray/80 hover:bg-ios-gray-light border border-transparent hover:border-line-soft transition-colors duration-150 ease-soft cursor-pointer focus-ring"
                    >
                        <MessageSquarePlus
                            size={18}
                            className="text-neutral-400 group-hover:text-white transition-colors"
                            strokeWidth={2}
                        />
                        <span className="block text-[15px] text-white font-medium">New chat</span>
                    </button>
                    {askHistory.length > 0 ? (
                        askHistory.map((item) => (
                            <div
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    onHideHistory();
                                    onContinueAskHistory?.(item);
                                }}
                                onKeyDown={activateOnKey(() => {
                                    onHideHistory();
                                    onContinueAskHistory?.(item);
                                })}
                                className="group relative flex items-center justify-between p-4 rounded-[16px] bg-ios-gray/50 hover:bg-ios-gray-light border border-transparent hover:border-line-soft transition-colors duration-150 ease-soft cursor-pointer focus-ring"
                            >
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-[15px] text-neutral-200 font-medium truncate">{item.question}</p>
                                    <p className="text-[12px] text-ink-300 mt-1 font-medium">
                                        {new Date(item.createdAt).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRequestConfirm({ type: "delete_ask", id: item.id });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition duration-150 ease-soft p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                                    title="Delete this Ask AI history"
                                    aria-label="Delete this Ask AI history"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-2">
                                <Bot size={32} className="text-brand-light" />
                            </div>
                            <p className="text-sm text-neutral-300 font-medium">No Ask AI history yet.</p>
                        </div>
                    )}
                </div>
            )}

            {mode === "replies" && (
                <div className="space-y-5">
                    {history.length > 0 ? (
                        <div className="grid gap-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex items-center justify-between p-4 rounded-[16px] bg-ios-gray/50 hover:bg-ios-gray-light border border-transparent transition-colors duration-150 ease-soft"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-[15px] text-neutral-200 font-medium truncate">
                                            {item.sentReply || item.contextSummary || "Generated Reply"}
                                        </p>
                                        <p className="text-[12px] text-ink-300 mt-1 font-medium">
                                            {new Date(item.createdAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRequestConfirm({ type: "delete_reply", id: item.id });
                                        }}
                                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition duration-150 ease-soft p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                                        title="Delete this reply history"
                                        aria-label="Delete this reply history"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-2">
                                <Bot size={32} className="text-brand-light" />
                            </div>
                            <p className="text-sm text-neutral-300 font-medium">No Reply History yet.</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

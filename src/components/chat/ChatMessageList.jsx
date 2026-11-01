/** Chat page message list: the empty-chat sticker, date dividers and grouped message bubbles. */
import { Plus } from "lucide-react";
import MessageBubble from "./MessageBubble";

const ChatMessageList = ({
    scrollContainerRef,
    messagesEndRef,
    messages,
    randomSticker,
    stickerMessage,
    onSendSticker,
    targetUser,
    openMenuId,
    toggleMenu,
    handleEditStart,
    handleDeleteStart,
    onReply,
    menuDirection,
    isSelectMode,
    selectedMessages,
    toggleMessageSelection,
    onEnterSelectMode,
    setToast,
    setOpenMenuId,
    setSelectedMessages,
}) => (
    <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-2 pr-2 py-4 space-y-1 scrollbar-hide relative z-10 opacity-100"
    >
        {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
                <button
                    type="button"
                    aria-label={`Send "${stickerMessage}"`}
                    onClick={onSendSticker}
                    className="relative group cursor-pointer active:scale-95 transition-all duration-300"
                >
                    <span className="absolute -inset-8 bg-violet-500/20 blur-3xl rounded-full animate-pulse z-0"></span>
                    <span className="absolute -inset-4 bg-fuchsia-500/10 blur-xl rounded-full z-0 group-hover:scale-110 transition-transform duration-500"></span>

                    <img
                        src={randomSticker.url}
                        alt=""
                        className="w-32 h-32 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:rotate-6 transition-transform duration-300"
                    />
                    <span className="absolute -top-2 -right-2 bg-pink-500 p-2 rounded-full text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-bounce duration-1000 z-20 border-2 border-black">
                        <Plus size={18} strokeWidth={4} />
                    </span>
                </button>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-white/90">{stickerMessage}!</h3>
                    <p className="text-sm text-neutral-500">Tap the sticker to start the conversation</p>
                </div>
            </div>
        ) : (
            messages.map((msg, index) => {
                const msgDate = new Date(msg.date).toLocaleDateString();
                const prevMsgDate = index > 0 ? new Date(messages[index - 1].date).toLocaleDateString() : null;
                const showDate = msgDate !== prevMsgDate;

                const prevMsg = index > 0 ? messages[index - 1] : null;
                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                const sameAsPrev = prevMsg && !showDate && prevMsg.isMe === msg.isMe;
                const sameAsNext =
                    nextMsg && new Date(nextMsg.date).toLocaleDateString() === msgDate && nextMsg.isMe === msg.isMe;
                const isFirstInGroup = !sameAsPrev;
                const isLastInGroup = !sameAsNext;

                return (
                    <div
                        key={msg.id}
                        data-id={msg.id}
                        className={`message-bubble-wrapper ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                    >
                        {showDate && (
                            <div className="flex items-center gap-6 my-6 px-4">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                                <div className="bg-white/[0.02] backdrop-blur-3xl px-6 py-2 rounded-full text-[10px] font-black text-white/50 border border-white/10 uppercase tracking-[0.2em] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                    {new Date(msg.date).toLocaleDateString(undefined, {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                    <div className="w-1 h-1 rounded-full bg-pink-500/50 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            </div>
                        )}
                        <MessageBubble
                            msg={msg}
                            targetUser={targetUser}
                            openMenuId={openMenuId}
                            toggleMenu={toggleMenu}
                            handleEdit={handleEditStart}
                            handleDelete={handleDeleteStart}
                            handleReply={onReply}
                            menuDirection={menuDirection}
                            isSelectMode={isSelectMode}
                            isSelected={selectedMessages.has(msg.id)}
                            onToggleSelect={toggleMessageSelection}
                            onEnterSelectMode={onEnterSelectMode}
                            setToast={setToast}
                            setOpenMenuId={setOpenMenuId}
                            setSelectedMessages={setSelectedMessages}
                            isFirstInGroup={isFirstInGroup}
                            isLastInGroup={isLastInGroup}
                        />
                    </div>
                );
            })
        )}
        <div ref={messagesEndRef} />
    </div>
);

export default ChatMessageList;

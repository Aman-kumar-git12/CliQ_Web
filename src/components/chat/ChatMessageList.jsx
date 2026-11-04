/** Chat page message list: the empty-chat sticker, date dividers and grouped message bubbles. */
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { EASE_SOFT } from "../common/motionPresets";

// Soft rise for messages that arrive while the chat is open. Only transform/opacity animate, so the list's
// height (and the scroll position anchored at the bottom) never jumps.
const NEW_MESSAGE_FROM = { opacity: 0, y: 8, scale: 0.98 };
const NEW_MESSAGE_TO = { opacity: 1, y: 0, scale: 1 };
const NEW_MESSAGE_TRANSITION = { duration: 0.22, ease: EASE_SOFT };

/**
 * Ids of the messages appended since the previous render, so only those animate in. History that is already there
 * when the list mounts (or replaces an empty list) shows up at once, and an id swap (temporary id → server id)
 * does not count as a new message.
 */
const useNewMessageIds = (messages) => {
    const [tracked, setTracked] = useState(() => ({ count: messages.length, ids: new Set() }));
    if (tracked.count === messages.length) return tracked.ids;

    const appended = tracked.count > 0 && messages.length > tracked.count;
    const ids = appended ? new Set(messages.slice(tracked.count).map((m) => m.id)) : new Set();
    // Adjusting state while rendering (React's "storing information from previous renders" pattern)
    setTracked({ count: messages.length, ids });
    return ids;
};

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
}) => {
    const newMessageIds = useNewMessageIds(messages);

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-2 pt-4 pb-3 scrollbar-hide relative z-10"
        >
            {messages.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: EASE_SOFT }}
                    className="h-full flex flex-col items-center justify-center gap-6"
                >
                    <button
                        type="button"
                        aria-label={`Send "${stickerMessage}"`}
                        onClick={onSendSticker}
                        className="relative group cursor-pointer rounded-3xl active:scale-95 transition-transform duration-150 ease-soft focus-ring"
                    >
                        <span className="absolute -inset-8 bg-brand/15 blur-3xl rounded-full motion-safe:animate-pulse z-0"></span>
                        <span className="absolute -inset-4 bg-brand-pink/10 blur-xl rounded-full z-0 group-hover:scale-110 transition-transform duration-300 ease-soft"></span>

                        <img
                            src={randomSticker.url}
                            alt=""
                            className="w-32 h-32 relative z-10 drop-shadow-[0_0_14px_rgba(139,92,246,0.3)] group-hover:rotate-6 transition-transform duration-300 ease-soft"
                        />
                        <span className="absolute -top-2 -right-2 bg-brand-pink p-2 rounded-full text-white shadow-lg shadow-brand-pink/30 motion-safe:animate-bounce z-20 border-2 border-surface-950">
                            <Plus size={18} strokeWidth={3} />
                        </span>
                    </button>
                    <div className="text-center space-y-1.5 px-6">
                        <h3 className="text-lg font-bold text-white/90">{stickerMessage}!</h3>
                        <p className="text-sm text-ink-300">Tap the sticker to start the conversation</p>
                    </div>
                </motion.div>
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
                        <motion.div
                            key={msg.id}
                            data-id={msg.id}
                            initial={newMessageIds.has(msg.id) ? NEW_MESSAGE_FROM : false}
                            animate={NEW_MESSAGE_TO}
                            transition={NEW_MESSAGE_TRANSITION}
                            style={{ transformOrigin: msg.isMe ? "100% 100%" : "0% 100%" }}
                            className={`message-bubble-wrapper ${index === 0 ? "" : isFirstInGroup ? "mt-3" : "mt-1"}`}
                        >
                            {showDate && (
                                <div className="flex items-center gap-4 my-5 px-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.06]" />
                                    <div className="bg-white/[0.03] px-4 py-1.5 rounded-full text-[10px] font-semibold text-ink-300 border border-line-soft uppercase tracking-[0.14em] flex items-center gap-2.5">
                                        <div className="w-1 h-1 rounded-full bg-brand/60" />
                                        {new Date(msg.date).toLocaleDateString(undefined, {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                        <div className="w-1 h-1 rounded-full bg-brand-pink/60" />
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.06]" />
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
                        </motion.div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessageList;

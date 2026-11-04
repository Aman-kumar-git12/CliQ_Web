/** Chat page input bar: attach button, reply preview, message box, emoji picker, AI button and mic/send button. */
import { Loader2, Mic, Plus, SendHorizontal, Smile, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import EmojiPicker from "../common/EmojiPicker";
import { formatRecordingTime } from "../../utils/chatPageHelpers";
import { EASE_SOFT } from "../common/motionPresets";

// Grow the message box to fit its text. The box starts from its current height so the height transition
// (transition-[height] on the textarea) runs from there instead of snapping. The end height is the same as before.
const growToFit = (el) => {
    const from = el.offsetHeight;
    el.style.height = "auto";
    const to = el.scrollHeight;
    if (to <= 32) return;
    if (from && from !== to) {
        el.style.height = from + "px";
        void el.offsetHeight; // commit the start height so the browser animates to the new one
    }
    el.style.height = to + "px";
};

const ChatComposer = ({
    fileInputRef,
    onFileChange,
    isUploading,
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    replyTo,
    onCancelReply,
    showAIOverlay,
    onOpenAssistant,
    inputRef,
    newMessage,
    setNewMessage,
    updateMessage,
    sendMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    emojiPickerRef,
    onEmojiClick,
}) => (
    <footer className="shrink-0 z-30 pt-3 pb-[calc(env(safe-area-inset-bottom)+24px)] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] bg-surface-900/75 backdrop-blur-2xl border-t border-line-soft">
        <div className="w-full flex items-end gap-1 md:gap-1.5">
            {/* Plus Action */}
            {!isRecording && (
                <button
                    type="button"
                    aria-label="Attach a file"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-[44px] h-[44px] mb-[6px] shrink-0 flex items-center justify-center text-brand hover:bg-white/[0.06] rounded-full transition duration-150 ease-soft active:scale-95 disabled:opacity-50 group/plus focus-ring`}
                >
                    <Plus
                        size={28}
                        strokeWidth={2.75}
                        className="group-hover/plus:rotate-90 transition-transform duration-200 ease-soft"
                    />
                </button>
            )}

            <div className="flex-1 min-w-0 bg-ios-gray/90 border border-line-soft rounded-[26px] px-2 py-1 shadow-soft flex flex-col relative group/input focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10 focus-within:bg-ios-gray-light/80 transition-[background-color,border-color,box-shadow] duration-200 ease-soft">
                {replyTo && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: EASE_SOFT }}
                        className="mx-1 mt-1 mb-1.5 pl-4 pr-2 py-2.5 bg-white/[0.04] border-l-[3px] border-brand rounded-[18px] flex items-center justify-between gap-2"
                    >
                        <div className="flex flex-col overflow-hidden min-w-0">
                            <span className="text-brand-light text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5">
                                Replying to {replyTo.firstname}
                            </span>
                            <span className="text-white/60 text-[13px] truncate font-medium">{replyTo.text}</span>
                        </div>
                        <button
                            type="button"
                            aria-label="Cancel reply"
                            onClick={onCancelReply}
                            className={`p-1.5 rounded-full text-ink-300 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 ease-soft focus-ring`}
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </motion.div>
                )}

                <div className="flex items-end gap-2">
                    {!isRecording ? (
                        <>
                            <button
                                type="button"
                                aria-label="Open AI assistant"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAssistant();
                                }}
                                className={`ml-2 mb-[7px] p-1.5 rounded-full transition duration-150 ease-soft active:scale-95 focus-ring ${showAIOverlay ? "text-brand bg-brand/10" : "text-ink-300 hover:text-ink-100 hover:bg-white/[0.05]"}`}
                            >
                                <Sparkles size={20} strokeWidth={2.5} />
                            </button>

                            <textarea
                                ref={inputRef}
                                rows="1"
                                maxLength={5000}
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    growToFit(e.target);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type a message..."
                                aria-label="Type a message"
                                className="flex-1 min-w-0 bg-transparent text-white text-[16px] md:text-[15px] leading-[22px] py-3 px-1 focus:outline-none placeholder:text-ink-300 resize-none max-h-48 transition-[height] duration-100 ease-soft motion-reduce:transition-none scrollbar-hide"
                            />

                            <button
                                type="button"
                                aria-label="Insert emoji"
                                aria-expanded={showEmojiPicker}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEmojiPicker(!showEmojiPicker);
                                }}
                                className={`p-1.5 mr-1.5 mb-[5px] rounded-full transition duration-150 ease-soft active:scale-95 focus-ring ${showEmojiPicker ? "text-brand bg-brand/10" : "text-ink-300 hover:text-ink-100 hover:bg-white/[0.05]"}`}
                            >
                                <Smile size={24} strokeWidth={2.25} />
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-between px-4 py-[9px] text-brand-light font-bold">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-brand rounded-full motion-safe:animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.7)]" />
                                <span className="tabular-nums text-lg">{formatRecordingTime(recordingTime)}</span>
                            </div>
                            <button
                                onClick={cancelRecording}
                                className={`px-2.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-ink-200 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 ease-soft focus-ring`}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {showEmojiPicker && (
                    <div
                        ref={emojiPickerRef}
                        className="absolute bottom-full right-0 mb-4 z-popover shadow-pop rounded-3xl overflow-hidden border border-line"
                    >
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme="dark"
                            width={320}
                            height={400}
                            skinTonesDisabled
                        />
                    </div>
                )}
            </div>

            {/* Mic / Send Button */}
            <button
                type="button"
                aria-label={isRecording || newMessage.trim() || updateMessage ? "Send message" : "Record voice message"}
                className={`rounded-full w-[48px] h-[48px] mb-[4px] shrink-0 flex items-center justify-center active:scale-95 transition duration-200 ease-soft relative overflow-hidden disabled:opacity-60 focus-ring ${isRecording || newMessage.trim() || updateMessage || (isUploading && audioBlob) ? "bg-gradient-to-br from-brand to-brand-pink text-white shadow-glow hover:brightness-110" : "bg-ios-gray text-white/90 border border-line-soft hover:bg-ios-gray-light"}`}
                onClick={
                    isUploading
                        ? null
                        : isRecording
                          ? stopRecording
                          : newMessage.trim() || updateMessage
                            ? sendMessage
                            : startRecording
                }
                disabled={isUploading && !audioBlob}
            >
                {isUploading && audioBlob ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                ) : isRecording || newMessage.trim() || updateMessage ? (
                    <SendHorizontal size={22} strokeWidth={2.5} className="ml-0.5" />
                ) : (
                    <Mic size={22} strokeWidth={2.5} />
                )}
            </button>
        </div>

        <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
        />
    </footer>
);

export default ChatComposer;

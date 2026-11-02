/** Chat page input bar: attach button, reply preview, message box, emoji picker, AI button and mic/send button. */
import { Loader2, Mic, Plus, SendHorizontal, Smile, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import EmojiPicker from "../common/EmojiPicker";
import { formatRecordingTime } from "../../utils/chatPageHelpers";

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
    <footer className="shrink-0 z-30 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pl-2 pr-2 bg-white/[0.03] backdrop-blur-3xl border-t border-white/10">
        <div className="w-full flex items-center gap-1 md:gap-1">
            {/* Plus Action */}
            {!isRecording && (
                <button
                    type="button"
                    aria-label="Attach a file"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-[44px] h-[44px] shrink-0 flex items-center justify-center text-brand hover:bg-white/5 rounded-full transition-all active:scale-95 group/plus"
                >
                    <Plus
                        size={28}
                        strokeWidth={3}
                        className="group-hover/plus:rotate-90 transition-transform duration-300"
                    />
                </button>
            )}

            <div className="flex-1 bg-ios-gray/90 backdrop-blur-3xl border border-white/5 rounded-[32px] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col relative group/input focus-within:border-brand/50 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.2)] focus-within:bg-[#252528] transition-all duration-300">
                {replyTo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-1 mb-2 px-4 py-3 bg-white/[0.03] backdrop-blur-xl border-l-[4px] border-brand rounded-[20px] flex items-center justify-between shadow-lg"
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-brand text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">
                                Replying to {replyTo.firstname}
                            </span>
                            <span className="text-white/60 text-[13px] truncate font-medium">{replyTo.text}</span>
                        </div>
                        <button
                            type="button"
                            aria-label="Cancel reply"
                            onClick={onCancelReply}
                            className="p-1.5 text-white/20 hover:text-white transition-colors"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>
                    </motion.div>
                )}

                <div className="flex items-center gap-2">
                    {!isRecording ? (
                        <>
                            <button
                                type="button"
                                aria-label="Open AI assistant"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAssistant();
                                }}
                                className={`ml-3 p-1.5 rounded-xl transition-all duration-300 ${showAIOverlay ? "text-brand scale-110" : "text-white/20 hover:text-white/60"}`}
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
                                    e.target.style.height = "auto";
                                    if (e.target.scrollHeight > 32) {
                                        e.target.style.height = e.target.scrollHeight + "px";
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type a message..."
                                aria-label="Type a message"
                                className="flex-1 bg-transparent text-white text-[15px] font-medium py-3 px-1 focus:outline-none placeholder-white/20 resize-none max-h-48 transition-all scrollbar-hide"
                            />

                            <button
                                type="button"
                                aria-label="Insert emoji"
                                aria-expanded={showEmojiPicker}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEmojiPicker(!showEmojiPicker);
                                }}
                                className={`p-1.5 mr-2 transition-all duration-300 ${showEmojiPicker ? "text-brand scale-110" : "text-white/20 hover:text-white/60"}`}
                            >
                                <Smile size={24} strokeWidth={2.5} />
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-between px-4 py-2 text-brand font-bold">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_#8b5cf6]" />
                                <span className="tabular-nums text-lg">{formatRecordingTime(recordingTime)}</span>
                            </div>
                            <button
                                onClick={cancelRecording}
                                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {showEmojiPicker && (
                    <div
                        ref={emojiPickerRef}
                        className="absolute bottom-full right-0 mb-6 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-300"
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
                className={`rounded-full w-[48px] h-[48px] shrink-0 flex items-center justify-center active:scale-90 transition-all duration-500 shadow-xl relative overflow-hidden ${isRecording || newMessage.trim() || updateMessage || (isUploading && audioBlob) ? "bg-gradient-to-r from-brand to-brand-pink text-white shadow-[0_5px_15px_rgba(139,92,246,0.4)]" : "bg-ios-gray text-white border border-white/5"}`}
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
                    <SendHorizontal size={22} strokeWidth={3} className="ml-1" />
                ) : (
                    <Mic size={22} strokeWidth={3} />
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

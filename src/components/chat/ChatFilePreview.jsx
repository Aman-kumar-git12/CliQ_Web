/** Chat page full-screen preview of a picked file with a caption box and send button. */
import { motion } from "framer-motion";
import { FileText, Loader2, SendHorizontal, X } from "lucide-react";
import { EASE_SOFT } from "../common/motionPresets";

const ChatFilePreview = ({ selectedFile, filePreview, fileCaption, setFileCaption, isUploading, onCancel, onSend }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE_SOFT }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-file-preview-title"
        className="absolute inset-0 z-[200] bg-black flex flex-col"
    >
        <div className="flex items-center justify-between gap-3 p-4 bg-black/20 backdrop-blur-md sticky top-0 z-10 border-b border-line-soft">
            <button
                type="button"
                aria-label="Discard file"
                onClick={onCancel}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-150 ease-soft focus-ring"
            >
                <X size={24} />
            </button>
            <div className="flex flex-col items-center min-w-0">
                <span id="chat-file-preview-title" className="text-[15px] font-semibold text-white truncate max-w-full">
                    {selectedFile.name}
                </span>
                <span className="text-[11px] text-ink-300 tabular-nums">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
            </div>
            <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-surface-900">
            {filePreview ? (
                <img
                    src={filePreview}
                    alt={`Preview of ${selectedFile.name}`}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
                />
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-ios-gray rounded-3xl flex items-center justify-center text-red-400 shadow-soft ring-1 ring-white/[0.06]">
                        <FileText size={48} />
                    </div>
                    <span className="text-white text-lg font-medium tracking-tight">Preview not available</span>
                    <span className="text-ink-300 text-sm">
                        Document: {selectedFile.name.split(".").pop().toUpperCase()}
                    </span>
                </div>
            )}
        </div>

        <div className="p-4 bg-surface-900/80 backdrop-blur-xl border-t border-line-soft pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 bg-ios-gray rounded-[24px] px-4 py-2 border border-line-soft transition-[border-color,box-shadow] duration-200 ease-soft focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10">
                    <textarea
                        autoFocus
                        placeholder="Add a caption..."
                        aria-label="Add a caption"
                        value={fileCaption}
                        onChange={(e) => setFileCaption(e.target.value)}
                        rows={1}
                        style={{ height: "auto" }}
                        className="w-full bg-transparent text-white py-1 outline-none text-[16px] placeholder:text-ink-300 resize-none scrollbar-hide"
                    />
                </div>
                <button
                    type="button"
                    aria-label="Send file"
                    onClick={onSend}
                    disabled={isUploading}
                    className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition duration-150 ease-soft active:scale-95 focus-ring ${isUploading ? "bg-ios-gray-light cursor-wait" : "bg-gradient-to-br from-brand to-brand-pink shadow-glow hover:brightness-110"}`}
                >
                    {isUploading ? (
                        <Loader2 size={24} className="text-white animate-spin" />
                    ) : (
                        <SendHorizontal size={24} className="text-white ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    </motion.div>
);

export default ChatFilePreview;

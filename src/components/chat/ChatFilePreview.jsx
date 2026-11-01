/** Chat page full-screen preview of a picked file with a caption box and send button. */
import { FileText, Loader2, SendHorizontal, X } from "lucide-react";

const ChatFilePreview = ({ selectedFile, filePreview, fileCaption, setFileCaption, isUploading, onCancel, onSend }) => (
    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-file-preview-title"
        className="absolute inset-0 z-[200] bg-[#000000] flex flex-col animate-in fade-in duration-200"
    >
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md sticky top-0 z-10">
            <button
                type="button"
                aria-label="Discard file"
                onClick={onCancel}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={24} />
            </button>
            <div className="flex flex-col items-center">
                <span id="chat-file-preview-title" className="text-[15px] font-semibold text-white">
                    {selectedFile.name}
                </span>
                <span className="text-[11px] text-neutral-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#0c0c0c]">
            {filePreview ? (
                <img
                    src={filePreview}
                    alt={`Preview of ${selectedFile.name}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            ) : (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-ios-gray rounded-2xl flex items-center justify-center text-[#ff3b30] shadow-xl ring-1 ring-white/5">
                        <FileText size={48} />
                    </div>
                    <span className="text-white text-lg font-medium tracking-tight">Preview not available</span>
                    <span className="text-neutral-500 text-sm">
                        Document: {selectedFile.name.split(".").pop().toUpperCase()}
                    </span>
                </div>
            )}
        </div>

        <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 bg-ios-gray-light rounded-[24px] px-4 py-2 ring-1 ring-white/5 shadow-inner">
                    <textarea
                        autoFocus
                        placeholder="Add a caption..."
                        aria-label="Add a caption"
                        value={fileCaption}
                        onChange={(e) => setFileCaption(e.target.value)}
                        rows={1}
                        style={{ height: "auto" }}
                        className="w-full bg-transparent text-white py-1 outline-none text-[16px] resize-none scrollbar-hide"
                    />
                </div>
                <button
                    type="button"
                    aria-label="Send file"
                    onClick={onSend}
                    disabled={isUploading}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${isUploading ? "bg-neutral-700" : "bg-ios-blue hover:bg-[#0066d6]"}`}
                >
                    {isUploading ? (
                        <Loader2 size={24} className="text-white animate-spin" />
                    ) : (
                        <SendHorizontal size={24} className="text-white ml-0.5" />
                    )}
                </button>
            </div>
        </div>
    </div>
);

export default ChatFilePreview;

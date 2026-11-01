/** Chat page bottom bar shown in multi-select mode: exit, selected count and delete. */
import { Loader2, Trash2, X } from "lucide-react";

const ChatSelectionBar = ({ selectedCount, isBulkDeleting, onExit, onDelete }) => (
    <div className="absolute bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-300">
        <div className="bg-surface-850/80 backdrop-blur-3xl border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+20px)] min-h-[90px] flex flex-col justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-full flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Exit selection"
                        onClick={onExit}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={26} />
                    </button>
                    <span className="text-lg font-black text-white italic uppercase tracking-tight">
                        {selectedCount} selected
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDelete}
                        disabled={selectedCount === 0 || isBulkDeleting}
                        className={`p-3 rounded-2xl transition-all ${selectedCount > 0 ? "text-red-500 hover:bg-red-500/10 active:scale-95" : "text-white/10"} ${isBulkDeleting ? "animate-pulse" : ""}`}
                        title="Delete"
                        aria-label="Delete selected messages"
                    >
                        {isBulkDeleting ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={24} />}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ChatSelectionBar;

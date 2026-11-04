/** Chat page bottom bar shown in multi-select mode: exit, selected count and delete. */
import { motion } from "framer-motion";
import { Loader2, Trash2, X } from "lucide-react";
import { EASE_SOFT } from "../common/motionPresets";

const ChatSelectionBar = ({ selectedCount, isBulkDeleting, onExit, onDelete }) => (
    <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE_SOFT }}
        className="absolute bottom-0 left-0 right-0 z-[100]"
    >
        <div className="bg-surface-850/85 backdrop-blur-2xl border-t border-line p-3 pb-[calc(env(safe-area-inset-bottom)+20px)] min-h-[90px] flex flex-col justify-center shadow-[0_-12px_32px_-12px_rgb(0_0_0/0.6)]">
            <div className="w-full flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Exit selection"
                        onClick={onExit}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-full transition duration-150 ease-soft active:scale-95 focus-ring"
                    >
                        <X size={24} />
                    </button>
                    <span className="text-lg font-black text-white italic uppercase tracking-tight tabular-nums">
                        {selectedCount} selected
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDelete}
                        disabled={selectedCount === 0 || isBulkDeleting}
                        className={`p-3 rounded-2xl transition duration-150 ease-soft focus-ring ${selectedCount > 0 ? "text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.14] active:scale-95" : "text-white/20"} ${isBulkDeleting ? "motion-safe:animate-pulse" : ""}`}
                        title="Delete"
                        aria-label="Delete selected messages"
                    >
                        {isBulkDeleting ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={22} />}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

export default ChatSelectionBar;

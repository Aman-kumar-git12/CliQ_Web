/** Chat page confirmation dialog for deleting the selected messages (for me / for everyone). */
import { motion } from "framer-motion";
import { EASE_SOFT } from "../common/motionPresets";

const ChatBulkDeleteDialog = ({ selectedCount, canDeleteForEveryone, onDelete, onCancel }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE_SOFT }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-modal flex items-center justify-center p-4"
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.22, ease: EASE_SOFT }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-bulk-delete-title"
            className="bg-surface-raised w-full max-w-[320px] rounded-[28px] overflow-hidden shadow-pop border border-line-strong p-7"
        >
            <h3 id="chat-bulk-delete-title" className="text-xl font-black text-center mb-2 italic uppercase">
                Delete Message?
            </h3>
            <p className="text-[13px] text-ink-200 text-center mb-6 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">{selectedCount}</span> messages
                from your history?
            </p>
            <div className="flex flex-col gap-3">
                {canDeleteForEveryone && (
                    <button
                        onClick={() => onDelete("everyone")}
                        className="w-full py-3.5 bg-red-500/10 text-red-400 font-bold uppercase text-[11px] tracking-[0.14em] hover:bg-red-500/[0.18] rounded-2xl transition duration-150 ease-soft active:scale-[0.98] focus-ring"
                    >
                        Delete for everyone
                    </button>
                )}
                <button
                    onClick={() => onDelete("me")}
                    className="w-full py-3.5 bg-white/[0.04] text-brand-light font-bold uppercase text-[11px] tracking-[0.14em] hover:bg-white/[0.08] rounded-2xl transition duration-150 ease-soft active:scale-[0.98] focus-ring"
                >
                    Delete for me
                </button>
                <button
                    onClick={onCancel}
                    className="w-full py-3.5 text-white/50 font-bold uppercase text-[11px] tracking-[0.14em] hover:text-white/80 hover:bg-white/[0.05] rounded-2xl transition duration-150 ease-soft active:scale-[0.98] focus-ring"
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    </motion.div>
);

export default ChatBulkDeleteDialog;

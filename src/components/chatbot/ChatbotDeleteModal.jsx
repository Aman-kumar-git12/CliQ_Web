/** Chatbot delete confirmation overlay for deleting one chat or clearing all history. */
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { EASE_SOFT } from "../common/motionPresets";

export default function ChatbotDeleteModal({ deleteConfirm, onCancel, onConfirmSingle, onConfirmAll }) {
    return (
        <AnimatePresence>
            {deleteConfirm.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE_SOFT }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ duration: 0.22, ease: EASE_SOFT }}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="chatbot-delete-title"
                        className="bg-surface-raised border border-line-strong rounded-3xl p-5 w-full max-w-[280px] flex flex-col items-center text-center shadow-pop"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                            <Trash2 className="text-red-400" size={24} />
                        </div>
                        <h3 id="chatbot-delete-title" className="text-white font-medium mb-1">
                            Delete Chat?
                        </h3>
                        <p className="text-neutral-400 text-sm mb-5">
                            {deleteConfirm.type === "single"
                                ? "Are you sure you want to delete this conversation?"
                                : "Are you sure you want to clear all chat history?"}
                        </p>
                        <div className="flex w-full gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition duration-150 ease-soft active:scale-[0.98] focus-ring"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteConfirm.type === "single" ? onConfirmSingle : onConfirmAll}
                                className="flex-1 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition duration-150 ease-soft active:scale-[0.98] shadow-md shadow-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** Chatbot delete confirmation overlay for deleting one chat or clearing all history. */
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function ChatbotDeleteModal({ deleteConfirm, onCancel, onConfirmSingle, onConfirmAll }) {
    return (
        <AnimatePresence>
            {deleteConfirm.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="chatbot-delete-title"
                        className="bg-[#13131a] border border-white/10 rounded-2xl p-5 w-full max-w-[280px] flex flex-col items-center text-center shadow-xl shadow-red-900/10"
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
                                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteConfirm.type === "single" ? onConfirmSingle : onConfirmAll}
                                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
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

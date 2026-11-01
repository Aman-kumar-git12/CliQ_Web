/** Animated "clear / delete history" confirmation dialog shown over the AI assistant. */
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function AIAssistantConfirmDialog({ confirmAction, mode, onCancel, onConfirm }) {
    return (
        <AnimatePresence>
            {confirmAction && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[110] bg-[#050507]/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="ai-assistant-confirm-title"
                        className="bg-ios-gray border border-white/10 rounded-3xl p-6 w-full max-w-[320px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-5 flex flex-col items-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                            <Trash2 size={20} className="text-red-400" />
                        </div>
                        <div className="space-y-2">
                            <h3
                                id="ai-assistant-confirm-title"
                                className="text-[13px] font-bold text-white tracking-widest uppercase"
                            >
                                {confirmAction.type.startsWith("clear") ? "Clear All History" : "Delete Item"}
                            </h3>
                            <p className="text-[12px] text-neutral-400 leading-relaxed px-2">
                                Are you sure you want to{" "}
                                {confirmAction.type.startsWith("clear") ? "permanently clear all your" : "delete this"}{" "}
                                {mode === "ask" ? "Ask AI" : "Reply"} history? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full pt-2">
                            <button
                                onClick={onCancel}
                                className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 rounded-full bg-red-500/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300 transition hover:bg-red-500/25 border border-red-500/10 hover:border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
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

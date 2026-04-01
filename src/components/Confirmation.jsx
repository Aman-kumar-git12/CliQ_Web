import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Confirmation({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "",
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmColor = "bg-red-500 hover:bg-red-600",
    isLoading = false
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-black/90 rounded-[32px] shadow-2xl p-8 w-full max-w-[340px] text-center border border-white/10 relative z-10 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                        <h2 className="text-xl font-black tracking-tight text-white uppercase italic mb-2">
                            {title}
                        </h2>
                        {message && (
                            <p className="mb-6 text-[13px] text-white/40 font-bold leading-relaxed">
                                {message}
                            </p>
                        )}
 
                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`w-full py-3.5 rounded-2xl text-white font-black uppercase italic tracking-widest text-[11px] transition-all active:scale-95 flex items-center justify-center ${confirmColor} shadow-lg`}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                ) : null}
                                {confirmText}
                            </button>

                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-2xl bg-white/5 text-white/40 hover:text-white font-black uppercase italic tracking-widest text-[11px] transition-all border border-white/5 active:scale-95"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

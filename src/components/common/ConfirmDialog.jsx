import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { backdropMotion, dialogMotion } from "./motionPresets";

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "",
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmColor = "bg-red-500 hover:bg-red-600",
    isLoading = false,
}) {
    const titleId = useId();
    const messageId = useId();
    const reduceMotion = useReducedMotion();

    // Escape closes the dialog (unless an action is in progress)
    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !isLoading) onClose?.();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);
    useBodyScrollLock(isOpen);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        {...backdropMotion}
                        className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        {...dialogMotion(reduceMotion)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={message ? messageId : undefined}
                        className="bg-surface-raised/95 backdrop-blur-xl rounded-[32px] shadow-pop p-8 w-full max-w-[340px] text-center border border-line-strong relative z-10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl pointer-events-none" />

                        <h2
                            id={titleId}
                            className="text-xl font-black tracking-tight text-ink-100 uppercase italic mb-2"
                        >
                            {title}
                        </h2>
                        {message && (
                            <p id={messageId} className="mb-6 text-[13px] text-ink-300 font-semibold leading-relaxed">
                                {message}
                            </p>
                        )}

                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`w-full py-3.5 rounded-2xl text-white font-black uppercase italic tracking-widest text-[11px] cliq-press disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center ${confirmColor} shadow-soft`}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                ) : null}
                                {confirmText}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-2xl bg-white/[0.04] text-ink-300 hover:text-ink-100 hover:bg-white/[0.07] font-black uppercase italic tracking-widest text-[11px] cliq-press disabled:opacity-60 disabled:cursor-not-allowed border border-line-soft"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

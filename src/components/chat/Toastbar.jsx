import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Info, CheckCircle2, AlertCircle, X, Smile, Loader2 } from "lucide-react";
import { EASE_SOFT } from "../common/motionPresets";

// Fades in on mount. For a fade-out too, render it inside an <AnimatePresence> (as ChatPage does).
const Toastbar = ({ message, onClose, duration = 3000, type = "info" }) => {
    // Callers pass a new onClose on every render; keeping it in a ref stops each re-render from restarting the timer
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    useEffect(() => {
        const timer = setTimeout(() => onCloseRef.current(), duration);
        return () => clearTimeout(timer);
    }, [duration, message]);

    const icons = {
        info: <Info size={16} className="text-brand-light" />,
        success: <CheckCircle2 size={16} className="text-emerald-400" />,
        error: <AlertCircle size={16} className="text-red-400" />,
        funny: <Smile size={16} className="text-yellow-400" />,
        loading: <Loader2 size={16} className="text-brand-light animate-spin" />,
    };

    return (
        <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2, ease: EASE_SOFT }}
            className="fixed bottom-28 right-20 sm:bottom-24 sm:inset-x-0 sm:mx-auto sm:w-fit z-toast flex items-center gap-3 pl-3 pr-2 py-2.5 cliq-popover rounded-2xl w-auto max-w-[calc(100vw-6rem)] sm:max-w-[420px]"
        >
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                {icons[type] || icons.info}
            </div>
            <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[12px] sm:text-[13px] font-black uppercase italic tracking-tight text-ink-100 truncate">
                    {message}
                </span>
            </div>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors duration-150 ease-soft group shrink-0 focus-ring"
            >
                <X size={14} className="text-ink-300 group-hover:text-white transition-colors duration-150" />
            </button>
        </motion.div>
    );
};

export default Toastbar;

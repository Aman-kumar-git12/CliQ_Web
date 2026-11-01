import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { TOAST_EVENT } from "../../utils/toast";

const VISIBLE_MS = 4500;
const MAX_TOASTS = 3;

// Renders toasts sent with showErrorToast(). The same message is shown once while it is on screen,
// so an outage that fails ten requests produces one toast, not ten.
export default function GlobalToaster() {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    useEffect(() => {
        const timers = new Set();
        const onToast = (event) => {
            const { message, kind = "error" } = event.detail || {};
            if (!message) return;
            setToasts((current) => {
                if (current.some((toast) => toast.message === message)) return current;
                const id = nextId.current++;
                const timer = setTimeout(() => {
                    setToasts((list) => list.filter((toast) => toast.id !== id));
                    timers.delete(timer);
                }, VISIBLE_MS);
                timers.add(timer);
                return [...current, { id, message, kind }].slice(-MAX_TOASTS);
            });
        };
        window.addEventListener(TOAST_EVENT, onToast);
        return () => {
            window.removeEventListener(TOAST_EVENT, onToast);
            timers.forEach(clearTimeout);
        };
    }, []);

    const dismiss = (id) => setToasts((list) => list.filter((toast) => toast.id !== id));

    return (
        <div
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 w-[calc(100%-32px)] max-w-md pointer-events-none"
            role="status"
            aria-live="polite"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        className="pointer-events-auto w-full flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#1a1220] border border-red-500/30 text-white shadow-2xl"
                    >
                        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="flex-1 text-[13px] leading-snug">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss"
                            className="text-white/40 hover:text-white shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { TOAST_EVENT } from "../../utils/toast";
import { DURATION, EASE_SOFT } from "./motionPresets";

const VISIBLE_MS = 4500;
const MAX_TOASTS = 3;

// Renders toasts sent with showErrorToast(). The same message is shown once while it is on screen,
// so an outage that fails ten requests produces one toast, not ten.
export default function GlobalToaster() {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    const reduceMotion = useReducedMotion();

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
            // Above dialogs (z-modal) so an error from a dialog's action isn't hidden behind it; on phones it sits
            // above the bottom nav and the home-indicator safe area
            className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 left-1/2 -translate-x-1/2 z-toast flex flex-col items-center gap-2 w-[calc(100%-32px)] max-w-md pointer-events-none"
            role="status"
            aria-live="polite"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout={reduceMotion ? false : "position"}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            reduceMotion
                                ? { opacity: 0, transition: { duration: DURATION.fast } }
                                : {
                                      opacity: 0,
                                      y: 8,
                                      scale: 0.97,
                                      transition: { duration: DURATION.fast, ease: EASE_SOFT },
                                  }
                        }
                        transition={{ duration: DURATION.panel, ease: EASE_SOFT }}
                        className="pointer-events-auto w-full flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl bg-surface-raised/95 backdrop-blur-xl border border-red-400/25 text-ink-100 shadow-pop"
                    >
                        <AlertCircle size={18} className="text-red-400 shrink-0" aria-hidden="true" />
                        <p className="flex-1 text-[13px] leading-[18px]">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss"
                            className="-mt-[3px] -mb-1 p-1 rounded-lg text-ink-300 hover:text-ink-100 hover:bg-white/[0.06] cliq-transition shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

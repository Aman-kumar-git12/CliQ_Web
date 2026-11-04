/** "AI is thinking..." bubble with bouncing dots and the live agent status line. */
import { motion, AnimatePresence } from "framer-motion";
import { EASE_SOFT } from "../common/motionPresets";

export default function ChatbotThinkingIndicator({ status }) {
    return (
        <div className="self-start flex flex-col gap-1.5 max-w-[85%]">
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_SOFT }}
                className="bg-white/[0.04] border border-line rounded-2xl rounded-tl-md px-4 py-3 self-start flex gap-2 items-center"
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -2, 0],
                                opacity: [0.35, 1, 0.35],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                            className="w-1.5 h-1.5 bg-brand-light rounded-full"
                        />
                    ))}
                </div>
                <span className="text-[11px] text-neutral-400 font-medium tracking-wide ml-1">AI is thinking...</span>
            </motion.div>
            <AnimatePresence mode="wait">
                {status && (
                    <motion.span
                        key={status}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        aria-live="polite"
                        className="text-[11px] text-ink-300 px-1"
                    >
                        {status}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

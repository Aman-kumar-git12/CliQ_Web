/** "AI is thinking..." bubble with bouncing dots and the live agent status line. */
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotThinkingIndicator({ status }) {
    return (
        <div className="self-start flex flex-col gap-1.5 max-w-[85%]">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 self-start flex gap-2 items-center shadow-lg"
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                            className="w-1.5 h-1.5 bg-violet-400 rounded-full"
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
                        className="text-[11px] text-neutral-500 px-1"
                    >
                        {status}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

/** Shimmering placeholder rows shown while the chatbot's session list loads. */
import { motion } from "framer-motion";

export default function ChatbotSkeletonSession() {
    return (
        <div className="flex flex-col gap-2 w-full p-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-white/5 overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                </div>
            ))}
        </div>
    );
}

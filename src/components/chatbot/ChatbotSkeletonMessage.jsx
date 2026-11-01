/** Shimmering placeholder bubbles shown while a chatbot conversation's history loads. */
import { motion } from "framer-motion";

export default function ChatbotSkeletonMessage() {
    return (
        <div className="flex flex-col gap-4 w-full">
            {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} w-full`}>
                    <div
                        className={`h-16 w-[70%] rounded-2xl bg-white/5 overflow-hidden relative ${i % 2 === 0 ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Row of tappable prompt chips (starter prompts or follow-up suggestions) in the chatbot. */
import { motion } from "framer-motion";
import { EASE_SOFT } from "../common/motionPresets";

export default function ChatbotSuggestionChips({ items, onSelect }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE_SOFT }}
            className="flex flex-wrap gap-2 self-start max-w-[92%]"
        >
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="px-3 py-1.5 rounded-full border border-brand/20 bg-brand/[0.08] hover:bg-brand/[0.16] hover:border-brand/35 hover:text-white text-violet-200 text-[12px] leading-snug text-left transition duration-150 ease-soft active:scale-[0.97] focus-ring"
                >
                    {item}
                </button>
            ))}
        </motion.div>
    );
}

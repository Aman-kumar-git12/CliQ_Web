/** A generated reply suggestion with "Insert" and "Send Now" actions. */
import { motion } from "framer-motion";
import { EASE_SOFT } from "../common/motionPresets";

export default function AIAssistantReplyCard({ text, highlighted = false, label = "", onUseReply, onSendReply }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_SOFT }}
            className={`group relative rounded-xl p-3 space-y-2 transition-colors duration-200 ease-soft ${
                highlighted
                    ? "border border-brand/25 bg-gradient-to-br from-brand/[0.08] via-white/[0.04] to-transparent shadow-[0_8px_32px_rgba(139,92,246,0.12)]"
                    : "border border-line-soft bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.10]"
            }`}
        >
            {highlighted && (
                <div className="absolute -top-px left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-brand/60 to-transparent rounded-full" />
            )}
            {label && (
                <p
                    className={`text-[9px] uppercase tracking-[0.2em] font-bold ${highlighted ? "text-violet-300/80" : "text-ink-300"}`}
                >
                    {label}
                </p>
            )}
            <p
                className={`${highlighted ? "text-[14px] leading-6 text-white font-medium tracking-[-0.01em]" : "text-[13px] leading-relaxed text-neutral-200"}`}
            >
                {text}
            </p>
            <div className="flex gap-1.5 pt-0.5">
                <button
                    onClick={() => onUseReply?.(text)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition duration-150 ease-soft active:scale-95 focus-ring ${
                        highlighted
                            ? "bg-white/[0.10] hover:bg-white/[0.16] border border-line-soft"
                            : "bg-white/[0.07] hover:bg-white/[0.12]"
                    }`}
                >
                    Insert
                </button>
                <button
                    onClick={() => onSendReply?.(text)}
                    className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/10 transition duration-150 ease-soft active:scale-95 focus-ring"
                >
                    Send Now
                </button>
            </div>
        </motion.div>
    );
}

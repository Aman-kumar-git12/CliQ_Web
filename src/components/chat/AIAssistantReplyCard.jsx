/** A generated reply suggestion with "Insert" and "Send Now" actions. */
import { motion } from "framer-motion";

export default function AIAssistantReplyCard({ text, highlighted = false, label = "", onUseReply, onSendReply }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`group relative rounded-xl p-3 space-y-2 transition-all duration-300 ${
                highlighted
                    ? "border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.04] to-transparent shadow-[0_8px_32px_rgba(99,102,241,0.12)]"
                    : "border border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.10]"
            }`}
        >
            {highlighted && (
                <div className="absolute -top-px left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />
            )}
            {label && (
                <p
                    className={`text-[9px] uppercase tracking-[0.2em] font-bold ${highlighted ? "text-violet-300/80" : "text-neutral-500"}`}
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
                    className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 active:scale-95 ${
                        highlighted
                            ? "bg-white/[0.10] hover:bg-white/[0.16] border border-white/[0.06]"
                            : "bg-white/[0.07] hover:bg-white/[0.12]"
                    }`}
                >
                    Insert
                </button>
                <button
                    onClick={() => onSendReply?.(text)}
                    className="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/10 transition-all duration-200 active:scale-95"
                >
                    Send Now
                </button>
            </div>
        </motion.div>
    );
}

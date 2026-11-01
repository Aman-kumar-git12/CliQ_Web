/** AI assistant title bar (history toggle + close) and the Ask AI / Generate Reply mode switch. */
import { Sparkles, X, History } from "lucide-react";

export default function AIAssistantHeader({
    title,
    subtitle,
    mode,
    showHistoryToggle,
    onToggleHistory,
    onClose,
    onModeChange,
}) {
    return (
        <>
            {/* Premium Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-[#16172a] via-[#0f1018] to-surface-900 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        <Sparkles size={18} className="text-violet-400" />
                    </div>
                    <div>
                        <h3 id="ai-assistant-title" className="text-sm font-bold text-white tracking-wide">
                            {title}
                        </h3>
                        <p className="text-[10px] text-violet-300/60 uppercase tracking-[0.2em] font-medium">
                            {subtitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleHistory}
                        className={`px-3 py-2 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 ${showHistoryToggle ? "bg-violet-600/20 text-violet-300" : "hover:bg-white/10 text-neutral-400 hover:text-white"}`}
                        title={mode === "ask" ? "Toggle Ask AI History" : "Toggle Generated Reply History"}
                    >
                        <History size={18} strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                            {mode === "ask" ? "Ask History" : "Reply History"}
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-label="Close assistant"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="sticky top-[77px] z-10 px-6 pt-4 pb-3 bg-[#050507]/95 backdrop-blur-xl border-b border-white/5">
                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                    <button
                        onClick={() => onModeChange?.("ask")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "ask" ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-white"}`}
                    >
                        Ask AI
                    </button>
                    <button
                        onClick={() => onModeChange?.("replies")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "replies" ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-white"}`}
                    >
                        Generate Reply
                    </button>
                </div>
            </div>
        </>
    );
}

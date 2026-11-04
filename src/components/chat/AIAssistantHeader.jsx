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
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 border-b border-line-soft bg-gradient-to-r from-brand/[0.1] via-surface-800 to-surface-900 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/15 flex items-center justify-center border border-brand/25 shadow-[0_0_14px_rgba(139,92,246,0.2)]">
                        <Sparkles size={18} className="text-brand-light" />
                    </div>
                    <div>
                        <h3 id="ai-assistant-title" className="text-sm font-bold text-white tracking-wide">
                            {title}
                        </h3>
                        <p className="text-[10px] text-violet-300/70 uppercase tracking-[0.18em] font-medium">
                            {subtitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleHistory}
                        className={`px-3 py-2 rounded-full transition duration-150 ease-soft active:scale-95 flex items-center justify-center gap-2 focus-ring ${showHistoryToggle ? "bg-brand/20 text-violet-200" : "hover:bg-white/[0.08] text-neutral-400 hover:text-white"}`}
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
                        className="p-2 rounded-full hover:bg-white/[0.08] text-neutral-400 hover:text-white transition duration-150 ease-soft active:scale-95 focus-ring"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="sticky top-[77px] z-10 px-6 pt-4 pb-3 bg-surface-950/95 backdrop-blur-xl border-b border-line-soft">
                <div className="inline-flex rounded-full border border-line bg-white/[0.03] p-1">
                    <button
                        onClick={() => onModeChange?.("ask")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-soft focus-ring ${mode === "ask" ? "bg-brand text-white shadow-glow" : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"}`}
                    >
                        Ask AI
                    </button>
                    <button
                        onClick={() => onModeChange?.("replies")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-soft focus-ring ${mode === "replies" ? "bg-brand text-white shadow-glow" : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"}`}
                    >
                        Generate Reply
                    </button>
                </div>
            </div>
        </>
    );
}

/** One row of the AI assistant's "thinking process" visualizer (pending / active / completed). */
import { CheckCircle2, Loader2 } from "lucide-react";

export default function AIAssistantThinkingStep({ icon: Icon, label, status = "pending" }) {
    const isCompleted = status === "completed";
    const isActive = status === "active";

    return (
        <div
            className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-all duration-500 ${isActive ? "bg-violet-500/10 border border-violet-500/20" : ""}`}
        >
            {isCompleted ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : isActive ? (
                <Loader2 size={14} className="text-violet-400 animate-spin" />
            ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
            )}
            <Icon
                size={14}
                className={isActive ? "text-violet-300" : isCompleted ? "text-neutral-400" : "text-neutral-600"}
            />
            <span
                className={`text-[12px] font-medium tracking-tight ${isActive ? "text-violet-100" : isCompleted ? "text-neutral-400" : "text-neutral-600"}`}
            >
                {label}
            </span>
        </div>
    );
}

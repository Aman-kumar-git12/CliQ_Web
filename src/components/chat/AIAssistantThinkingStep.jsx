/** One row of the AI assistant's "thinking process" visualizer (pending / active / completed). */
import { CheckCircle2, Loader2 } from "lucide-react";

export default function AIAssistantThinkingStep({ icon: Icon, label, status = "pending" }) {
    const isCompleted = status === "completed";
    const isActive = status === "active";

    return (
        <div
            className={`flex items-center gap-2.5 py-1 px-2 rounded-lg border transition-colors duration-300 ease-soft ${isActive ? "bg-brand/10 border-brand/20" : "border-transparent"}`}
        >
            {isCompleted ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : isActive ? (
                <Loader2 size={14} className="text-brand-light animate-spin" />
            ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-line-strong" />
            )}
            <Icon
                size={14}
                className={isActive ? "text-violet-300" : isCompleted ? "text-neutral-400" : "text-ink-400"}
            />
            <span
                className={`text-[12px] font-medium tracking-tight ${isActive ? "text-violet-100" : isCompleted ? "text-neutral-400" : "text-ink-400"}`}
            >
                {label}
            </span>
        </div>
    );
}

/** Small uppercase label (with optional icon) heading an AI assistant reply section. */

export default function AIAssistantSectionLabel({ children, icon: LabelIcon, className = "" }) {
    return (
        <div className={`flex items-center gap-2 mb-2 ${className}`}>
            {LabelIcon && (
                <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
                    <LabelIcon size={11} className="text-neutral-400" />
                </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">{children}</p>
        </div>
    );
}

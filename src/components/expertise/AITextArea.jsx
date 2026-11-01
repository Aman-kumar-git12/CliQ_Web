/** Labelled textarea with an icon, used in the AI Architect modal. */
import { useId } from "react";

const AITextArea = ({ label, value, onChange, placeholder, icon }) => {
    const fieldId = useId();
    return (
        <div className="space-y-3">
            <label
                htmlFor={fieldId}
                className="ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
            >
                {icon}
                {label}
            </label>
            <textarea
                id={fieldId}
                className="min-h-[112px] w-full resize-none rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default AITextArea;

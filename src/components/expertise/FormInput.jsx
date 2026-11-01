/** Labelled text input / textarea used by the Expertise Studio form. */
import { useId } from "react";

const FormInput = ({ label, value, onChange, placeholder, type = "text", textarea = false }) => {
    const fieldId = useId();
    return (
        <div className="space-y-2 group">
            <label
                htmlFor={fieldId}
                className="ml-1 cursor-text text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 transition-colors group-focus-within:text-slate-900"
            >
                {label}
            </label>
            {textarea ? (
                <textarea
                    id={fieldId}
                    className="min-h-[112px] w-full resize-none rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all hover:border-slate-300 hover:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <input
                    id={fieldId}
                    type={type}
                    className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all hover:border-slate-300 hover:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </div>
    );
};

export default FormInput;

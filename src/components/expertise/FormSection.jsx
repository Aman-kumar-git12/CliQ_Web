/** Titled card section used to group fields in the Expertise Studio form. */
const FormSection = ({ title, icon, children }) => (
    <div className="space-y-4 animate-slideUp">
        <div className="flex items-center gap-4 group/sec">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition-all duration-300 group-hover/sec:border-slate-300">
                {icon}
            </div>
            <h3 className="cursor-default text-lg font-black tracking-tight text-slate-950 transition-colors">
                {title}
            </h3>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-slate-300">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-indigo-50 blur-[70px]" />
            {children}
        </div>
    </div>
);

export default FormSection;

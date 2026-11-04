/** Titled card section used to group fields in the Expertise Studio form. */
const FormSection = ({ title, icon, children }) => (
    <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center gap-4 group/sec">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition-colors duration-200 ease-out group-hover/sec:border-slate-300">
                {icon}
            </div>
            <h3 className="cursor-default text-lg font-black tracking-tight text-slate-950">{title}</h3>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl transition-colors duration-200 ease-out hover:border-slate-300">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-brand/5 blur-[70px]" />
            {children}
        </div>
    </div>
);

export default FormSection;

/** Small label/value stat tile shown in the Expertise Studio intro card. */
const MiniStat = ({ label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
);

export default MiniStat;

import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const ConnectionNudge = ({ nudge }) => {
    if (!nudge) return null;
    return (
        <div className="absolute top-5 left-5 z-30 max-w-xs rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/80 mb-1">Improve Matches</p>
            <p className="text-[12px] leading-[1.55] text-amber-50/90">{nudge}</p>
            <Link
                to="/profile/expertise=True"
                className="inline-flex mt-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 hover:text-white transition-colors duration-150 ease-soft focus-ring"
            >
                Complete Profile
            </Link>
        </div>
    );
};

export const InsightCard = ({ label, value, icon, onView }) => {
    return (
        <div className="rounded-3xl border border-line-soft bg-white/[0.03] p-4 transition-colors duration-150 ease-soft hover:border-line hover:bg-white/[0.045]">
            <div className="flex items-center gap-2 text-ink-400 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            {onView && (
                <button
                    onClick={onView}
                    className="mt-4 px-3 py-2 rounded-xl border border-line bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 hover:text-white cliq-press focus-ring"
                >
                    Show
                </button>
            )}
        </div>
    );
};

export const BreakdownCard = ({ title, items, formatter = (value) => value }) => {
    return (
        <div className="rounded-3xl border border-line-soft bg-white/[0.03] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-ink-300 mb-4">{title}</h4>
            <div className="space-y-3">
                {(!items || items.length === 0) && <p className="text-sm text-ink-400">No data yet.</p>}
                {(items || []).map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3"
                    >
                        <span className="text-sm text-ink-200">{formatter(label)}</span>
                        <span className="text-sm font-black text-white">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BreakdownInline = ({ label, items, formatter = (value) => value }) => {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ink-300 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
                {(!items || items.length === 0) && <span className="text-sm text-ink-400">No data yet.</span>}
                {(items || []).map(([itemLabel, value]) => (
                    <span
                        key={itemLabel}
                        className="px-3 py-2 rounded-xl border border-line bg-white/5 text-[11px] text-ink-100"
                    >
                        {formatter(itemLabel)}: {value}
                    </span>
                ))}
            </div>
        </div>
    );
};

export const TrendCard = ({ title, trend = [] }) => {
    return (
        <div className="rounded-3xl border border-line-soft bg-white/[0.03] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-ink-300 mb-4">{title}</h4>
            <div className="space-y-3">
                {(trend || []).slice(-7).map((day) => (
                    <div key={day.date} className="rounded-2xl bg-black/20 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-white">{day.date}</span>
                            <span className="text-[11px] text-ink-300">
                                {day.shown} shown • {day.interested} interested • {day.saved} saved
                            </span>
                        </div>
                    </div>
                ))}
                {(!trend || trend.length === 0) && <p className="text-sm text-ink-400">No trend data yet.</p>}
            </div>
        </div>
    );
};

export const PanelHeader = ({ title, subtitle, onClose }) => (
    <div className="p-6 border-b border-line-soft flex justify-between items-center bg-surface-raised/80 backdrop-blur-md">
        <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-ink-300 mt-1">{subtitle}</p>}
        </div>
        <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 cliq-transition text-white/70 hover:text-white focus-ring"
        >
            <X size={20} />
        </button>
    </div>
);

/** Card showing one AI-generated expertise field (text or skill chips). */
import { withStableKeys } from "../../utils/listKeys";

const GeneratedDetailCard = ({ title, content, skills, icon, compact = false }) => (
    <div
        className={`rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 backdrop-blur-sm ${compact ? "" : "min-h-[160px]"}`}
    >
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm">{icon}</div>
        <div className="mt-4 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{title}</p>
            {skills ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {withStableKeys(skills || []).map(({ value: skill, key }) => (
                        <span
                            key={key}
                            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm"
                        >
                            {skill}
                        </span>
                    ))}
                    {(!skills || skills.length === 0) && (
                        <p className="text-sm font-medium text-slate-500">Not provided</p>
                    )}
                </div>
            ) : (
                <p
                    className={`${compact ? "truncate" : "line-clamp-5"} mt-2 text-sm font-medium leading-relaxed text-slate-700`}
                >
                    {content || "Not provided"}
                </p>
            )}
        </div>
    </div>
);

export default GeneratedDetailCard;

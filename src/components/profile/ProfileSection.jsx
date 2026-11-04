/** Shared heading, empty state and empty-state action link, so every profile tab on both pages looks the same. */
import { Link } from "react-router-dom";

export function ProfileSectionHeading({ title, count, action }) {
    return (
        <div className="flex items-center justify-between gap-3 mb-4 px-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                {title}
                {count !== undefined && count !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-line-soft text-xs font-medium text-ink-300 tabular-nums">
                        {count}
                    </span>
                )}
            </h2>
            {action}
        </div>
    );
}

export function ProfileEmptyState({ icon: Icon, title, hint, action }) {
    return (
        <div className="flex flex-col items-center gap-2 text-center px-6 py-14 rounded-3xl border border-dashed border-line bg-white/[0.02]">
            {Icon && (
                <span
                    aria-hidden="true"
                    className="mb-1 w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light"
                >
                    <Icon size={20} />
                </span>
            )}
            <p className="text-base font-medium text-ink-100">{title}</p>
            {hint && <p className="max-w-xs text-sm text-ink-300">{hint}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}

/** Calm pill link used as the `action` of an empty state. */
export function ProfileEmptyAction({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand/15 border border-brand/25 text-sm font-medium text-brand-light no-underline hover:bg-brand/20 hover:border-brand/35 hover:text-white cliq-press focus-ring"
        >
            {children}
        </Link>
    );
}

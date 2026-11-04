// Shared Tailwind class strings for the auth screens (login, signup, OTP, email verification, blocked account),
// so their cards, fields, buttons and notices look and move the same way.
import { EASE_SOFT } from "../common/motionPresets";

/** Full-screen page behind the auth card, with a faint brand glow at the top. */
export const authPageClass =
    "relative min-h-screen bg-surface-950 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.10),transparent_60%)] text-white flex flex-col items-center justify-center px-4 py-12";

/** The centred card holding a form. */
export const authCardClass = "w-full rounded-3xl border border-line bg-surface-800/80 backdrop-blur-xl shadow-soft-lg";

/** Wrapper around an icon + input pair; `hasError` gives it the error border. */
export const authFieldClass = (hasError = false) =>
    `group flex items-center gap-2.5 rounded-xl border bg-white/[0.03] px-3.5 py-3 transition-[border-color,box-shadow,background-color] duration-150 ease-soft focus-within:bg-white/[0.05] focus-within:ring-4 ${
        hasError
            ? "border-red-400/50 focus-within:border-red-400/70 focus-within:ring-red-500/10"
            : "border-line hover:border-line-strong focus-within:border-brand/50 focus-within:ring-brand/10"
    }`;

/** Leading icon inside a field: brightens while the field has focus. */
export const authFieldIconClass =
    "shrink-0 text-ink-300 group-focus-within:text-brand-light transition-colors duration-150";

/** The bare input inside a field (16px text so iOS does not zoom in on focus). */
export const authInputClass =
    "w-full min-w-0 bg-transparent outline-none text-base text-white placeholder:text-ink-300 [color-scheme:dark]";

/** Small icon button inside a field (show/hide password). */
export const authFieldButtonClass =
    "shrink-0 rounded-md p-0.5 text-ink-300 hover:text-white transition-colors duration-150 focus-ring";

const focusRing = "focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900";

/** Main call to action (white pill). */
export const authPrimaryButtonClass = `w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-3 font-semibold text-black shadow-[0_8px_24px_-12px_rgba(255,255,255,0.35)] transition duration-150 ease-soft hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;

/** Secondary action (outlined pill). */
export const authSecondaryButtonClass = `w-full inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-white/[0.04] py-3 font-medium text-white transition duration-150 ease-soft hover:bg-white/[0.08] hover:border-line-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${focusRing}`;

/** Inline text link / text button. */
export const authLinkClass =
    "rounded-sm underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-colors duration-150 focus-ring";

/** Notice boxes under a form. */
export const authNoticeClass = {
    error: "rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-red-300",
    success:
        "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-emerald-300",
    warning:
        "rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm leading-relaxed text-amber-200",
};

/** Small spinner for buttons in their loading state (inherits the text colour). */
export const authSpinnerClass =
    "h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin";

/** framer-motion props for notices and steps that appear: a short fade/rise. */
export const authAppear = {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.2, ease: EASE_SOFT },
};

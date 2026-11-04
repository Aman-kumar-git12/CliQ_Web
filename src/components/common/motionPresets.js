// @ts-check
// Shared framer-motion timings, so every dialog, menu and toast moves the same way. Matches the CSS side:
// --cliq-ease / ease-soft and the 150 / 220 / 250 ms durations in index.css (see README "Conventions").

/** Quick start, gentle landing (same curve as `ease-soft` in Tailwind). */
export const EASE_SOFT = /** @type {const} */ ([0.22, 1, 0.36, 1]);

/** Seconds. fast: hover/press feedback, panel: menus, dialogs, toasts, page: page-sized surfaces. */
export const DURATION = /** @type {const} */ ({ fast: 0.15, panel: 0.22, page: 0.25 });

/** Fade for a dimmed backdrop behind a dialog or sheet. */
export const backdropMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.panel, ease: EASE_SOFT } },
    exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_SOFT } },
};

/**
 * Centered dialog: fades and settles in, leaves a little faster than it came.
 * @param {boolean | null} [reduceMotion] result of framer-motion's useReducedMotion(); true keeps only the fade
 */
export const dialogMotion = (reduceMotion = false) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.panel, ease: EASE_SOFT } },
    exit: reduceMotion
        ? { opacity: 0, transition: { duration: DURATION.fast } }
        : { opacity: 0, scale: 0.97, y: 6, transition: { duration: DURATION.fast, ease: EASE_SOFT } },
});

/**
 * Dropdown menu / popover opening from its trigger (set transform-origin with a Tailwind origin-* class).
 * @param {boolean | null} [reduceMotion]
 */
export const popoverMotion = (reduceMotion = false) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.panel, ease: EASE_SOFT } },
    exit: reduceMotion
        ? { opacity: 0, transition: { duration: DURATION.fast } }
        : { opacity: 0, scale: 0.97, y: -2, transition: { duration: DURATION.fast, ease: EASE_SOFT } },
});

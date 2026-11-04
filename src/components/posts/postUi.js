// Class strings for the post UI (feed cards, post page, composer, saved posts), so hover/press timing, focus rings
// and entrance motion feel the same everywhere. They are thin names over the shared tokens in src/index.css and
// tailwind.config.js (cliq-transition, cliq-press, focus-ring, cliq-popover, ease-soft, --cliq-dur-*), so a timing
// or colour change there reaches the post UI too. Movement (scale, slide) is gated behind `motion-safe:`; the global
// reduced-motion rule in index.css also finishes any remaining transition at once.

/** Keyboard focus ring (mouse clicks don't show it). */
export const FOCUS_RING = "focus-ring";

/** Hover/press change (colour, border, shadow, transform): 150ms, soft ease. */
export const SOFT_TRANSITION = "cliq-transition";

/** Small press-down on click/tap (includes the transition). */
export const PRESS = "cliq-press";

/** Icon inside a `group` button: grows a little on hover, dips on press. */
export const ICON_FEEDBACK =
    "transition-transform duration-150 ease-soft motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90";

/** Newly mounted content (posts appended to a list, a page body): opacity only, so nothing moves or jumps. */
export const FADE_IN = "motion-safe:animate-[fadeIn_var(--cliq-dur-page)_var(--cliq-ease)]";

/** Menus, popovers and expanding panels: fade in while settling down a few pixels. */
export const DROP_IN = "motion-safe:animate-[slideDown_var(--cliq-dur-panel)_var(--cliq-ease)]";

/** Floating menu frame (above the card it opens from). */
export const MENU = "cliq-popover rounded-xl z-popover overflow-hidden py-1";

/** Rows inside a dropdown menu. */
export const MENU_ITEM = `w-full flex items-center gap-3 px-4 py-2.5 text-left text-[12px] font-bold ${SOFT_TRANSITION} focus-visible:outline-none focus-visible:bg-white/[0.06]`;

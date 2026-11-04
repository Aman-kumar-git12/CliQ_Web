/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            // CliQ palette. Use these names (bg-surface-800, text-ink-450, border-brand/30…) instead of raw hex values,
            // so a colour change happens here once. Rarely used one-off colours can stay inline.
            colors: {
                brand: {
                    DEFAULT: "#8b5cf6", // primary purple: buttons, highlights, focus
                    light: "#a78bfa", // lilac: links, active text
                    pink: "#ec4899", // gradient partner of the purple
                    rose: "#f472b6",
                },
                // Text greys, light to dark. Body text on any surface: ink-100 / ink-200 / ink-300 / ink-350
                // (all WCAG AA, 4.5:1+). ink-400 and darker are for large text, icons and decoration only.
                ink: {
                    100: "#ebe7f7",
                    200: "#c4bfd6", // secondary text that must stay easy to read (between 100 and 300)
                    300: "#8f89a7",
                    350: "#8b86a6",
                    400: "#6f6a86",
                    450: "#6d6a86",
                    500: "#5f5a78",
                    550: "#55516a",
                    600: "#413c58",
                },
                // Background layers, darkest first
                surface: {
                    950: "#050505",
                    900: "#0a0a0d",
                    850: "#0a0a0f",
                    800: "#0e0d14",
                    750: "#0f0f1a",
                    700: "#110f18",
                    600: "#1c1a24",
                    night: "#0f041e",
                    sidebar: "#12111d", // top of the desktop sidebar gradient
                    raised: "#16141f", // floating layers: menus, popovers, toasts, dialogs (between 700 and 600)
                },
                // Hairline borders: white at a fixed low opacity, so borders look the same on every surface
                line: {
                    soft: "rgb(255 255 255 / 0.06)", // dividers inside a card
                    DEFAULT: "rgb(255 255 255 / 0.09)", // card / panel / input edge
                    strong: "rgb(255 255 255 / 0.14)", // hovered edge, floating layer edge
                },
                // Chat bubbles (iOS-style)
                ios: {
                    blue: "#007aff",
                    gray: "#1c1c1e",
                    "gray-light": "#2c2c2e",
                },
            },
            // Soft, diffuse shadows (negative spread keeps them from looking like a hard dark outline)
            boxShadow: {
                soft: "0 2px 8px -2px rgb(0 0 0 / 0.35), 0 8px 24px -8px rgb(0 0 0 / 0.4)", // cards, buttons
                "soft-lg": "0 4px 12px -4px rgb(0 0 0 / 0.4), 0 16px 40px -12px rgb(0 0 0 / 0.55)", // panels, bars
                pop: "0 8px 24px -6px rgb(0 0 0 / 0.5), 0 24px 56px -16px rgb(0 0 0 / 0.6), inset 0 1px 0 rgb(255 255 255 / 0.04)", // menus, dialogs, toasts
                glow: "0 0 18px -4px rgb(139 92 246 / 0.45)", // brand glow for an active / primary element
                "glow-pink": "0 0 14px -3px rgb(236 72 153 / 0.45)", // badges
                hairline: "inset 0 1px 0 rgb(255 255 255 / 0.04)", // top highlight on a raised surface
                rail: "12px 0 40px -16px rgb(0 0 0 / 0.7)", // desktop sidebar edge
            },
            dropShadow: {
                glow: "0 0 8px rgb(139 92 246 / 0.5)", // active nav icon
            },
            // One easing for everything that moves: quick start, gentle landing
            transitionTimingFunction: {
                soft: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            transitionDuration: {
                250: "250ms",
            },
            zIndex: {
                // Layer scale for fixed UI (see README "Conventions"); existing z-[n] values map onto it
                sidebar: "50",
                nav: "100",
                popover: "150",
                modal: "1000",
                splash: "1100",
                toast: "1200",
            },
        },
    },
    plugins: [],
};

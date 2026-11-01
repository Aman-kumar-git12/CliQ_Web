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
                // Text greys, light to dark
                ink: {
                    100: "#ebe7f7",
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
                },
                // Chat bubbles (iOS-style)
                ios: {
                    blue: "#007aff",
                    gray: "#1c1c1e",
                    "gray-light": "#2c2c2e",
                },
            },
        },
    },
    plugins: [],
};

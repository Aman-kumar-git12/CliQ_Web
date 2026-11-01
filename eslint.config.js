import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,jsx}"],
        plugins: { react },
        extends: [js.configs.recommended, reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        rules: {
            // Without this, components used only in JSX (<motion.div>, <Icon />) count as unused.
            "react/jsx-uses-vars": "error",
            "no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
        },
    },
    {
        // Context modules intentionally export their provider alongside a use* hook.
        files: ["src/context/**/*.{js,jsx}"],
        rules: { "react-refresh/only-export-components": "off" },
    },
    // Last: turns off style rules that would fight Prettier
    prettier,
]);

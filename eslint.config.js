import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";

const unusedVarsRule = ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }];

export default defineConfig([
    globalIgnores(["dist", "dist-e2e", "playwright-report", "test-results", ".lighthouseci"]),
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
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
            "no-unused-vars": unusedVarsRule,
        },
    },
    {
        // New code may be TypeScript (see tsconfig.json): parse it and use the TS-aware versions of the core rules
        files: ["**/*.{ts,tsx}"],
        extends: [tseslint.configs.recommended],
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": unusedVarsRule,
        },
    },
    {
        // Context modules intentionally export their provider alongside a use* hook.
        files: ["src/context/**/*.{js,jsx}"],
        rules: { "react-refresh/only-export-components": "off" },
    },
    {
        // Playwright end-to-end tests and tool configs run in Node, not the browser
        files: ["e2e/**/*.{js,ts}", "*.config.{js,ts}"],
        languageOptions: { globals: globals.node },
        rules: { "react-hooks/rules-of-hooks": "off", "react-refresh/only-export-components": "off" },
    },
    // Last: turns off style rules that would fight Prettier
    prettier,
]);

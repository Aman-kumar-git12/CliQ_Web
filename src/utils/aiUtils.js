// @ts-check
/**
 * Shared utilities for AI-powered components (Chatbot, MessageAssistant, etc.)
 */
import { createElement } from "react";
import { Link } from "react-router-dom";

// Pages the AI may deep-link to. Keep in sync with LINKABLE_PAGES in WebsiteAgent/src/chat/pages.py.
export const INTERNAL_LINK_ALLOWLIST = new Set([
    "/home",
    "/search",
    "/find/getconnection",
    "/requests",
    "/create/post",
    "/edit-profile",
    "/settings",
    "/messages",
    "/my-experties",
    "/profile",
]);

/** @param {unknown} href */
const toAllowedPath = (href) => {
    if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return null;
    const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    return INTERNAL_LINK_ALLOWLIST.has(path) ? path : null;
};

/**
 * First balanced `{...}` block in a model reply, or null.
 * @param {string | null | undefined} text
 * @returns {string | null}
 */
export const extractJsonBlock = (text) => {
    if (!text) return null;
    const start = text.indexOf("{");
    if (start === -1) return null;

    let depth = 0;
    for (let i = start; i < text.length; i += 1) {
        const char = text[i];
        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;
        if (depth === 0) {
            return text.slice(start, i + 1);
        }
    }
    return null;
};

/** @param {string} key e.g. "next_steps" or "nextSteps" → "Next Steps" */
export const humanizeKey = (key) =>
    key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Steps the assistant returned as JSON, or null when the reply isn't a steps list.
 * @param {string | null | undefined} text
 * @returns {{ title: string, steps: string[] } | null}
 */
export const parseStructuredSteps = (text) => {
    if (!text) return null;

    try {
        const jsonBlock = extractJsonBlock(text);
        if (!jsonBlock) return null;

        const parsed = JSON.parse(jsonBlock);

        // Standard RAG steps format: { "title": "...", "steps": ["...", "..."] }
        if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
            return {
                title: parsed.title || "Steps",
                steps: parsed.steps.filter(Boolean),
            };
        }

        // Fallback for key-value pair steps (step1: "...", step2: "...")
        const rootEntry = Object.entries(parsed).find(([, value]) => Array.isArray(value) || typeof value === "object");
        if (!rootEntry) return null;

        const [rawTitle, rawValue] = rootEntry;
        const stepSource = Array.isArray(rawValue) ? rawValue[0] : rawValue;
        if (!stepSource || typeof stepSource !== "object") return null;

        const orderedSteps = Object.entries(stepSource)
            .filter(([key, value]) => /^step\d+$/i.test(key) && typeof value === "string" && value.trim())
            .sort(([a], [b]) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")))
            .map(([, value]) => value.trim());

        if (orderedSteps.length === 0) return null;

        return {
            title: humanizeKey(rawTitle),
            steps: orderedSteps,
        };
    } catch {
        return null;
    }
};

/**
 * Props react-markdown passes to the renderers below.
 * @typedef {{ children?: import("react").ReactNode, href?: string, inline?: boolean }} MarkdownProps
 */

/** @type {Record<string, (props: MarkdownProps) => import("react").ReactElement>} */
export const markdownComponents = {
    h2: ({ children }) =>
        createElement("h2", { className: "text-white font-semibold text-[15px] mb-3 mt-4 first:mt-0" }, children),
    h3: ({ children }) => createElement("h3", { className: "text-white font-medium text-[14px] mb-2 mt-3" }, children),
    p: ({ children }) =>
        createElement("p", { className: "mb-3 last:mb-0 text-neutral-300 leading-relaxed text-[13.5px]" }, children),
    ul: ({ children }) => createElement("ul", { className: "space-y-3 pl-1 my-3" }, children),
    ol: ({ children }) => createElement("ol", { className: "space-y-3 pl-1 my-3" }, children),
    li: ({ children }) =>
        createElement(
            "li",
            { className: "flex items-start gap-2.5 text-neutral-300" },
            createElement("span", {
                className:
                    "mt-[8px] h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
            }),
            createElement("span", { className: "flex-1 text-[13.5px] leading-relaxed" }, children),
        ),
    strong: ({ children }) => createElement("strong", { className: "text-white font-bold" }, children),
    // Allowlisted pages become in-app buttons; any other link is shown as plain text
    a: ({ href, children }) => {
        const path = toAllowedPath(href);
        if (!path) return createElement("span", null, children);
        return createElement(
            Link,
            {
                to: path,
                className:
                    "inline-flex items-center gap-1 mt-1 px-3 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-violet-200 text-[12.5px] font-medium no-underline transition-colors",
            },
            children,
            createElement("span", { "aria-hidden": true }, "→"),
        );
    },
    code: ({ inline, children }) =>
        inline
            ? createElement(
                  "code",
                  { className: "px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 text-[12px] font-mono" },
                  children,
              )
            : createElement(
                  "code",
                  {
                      className:
                          "block overflow-x-auto rounded-xl bg-surface-900 border border-white/10 p-4 text-[12px] text-neutral-300 font-mono my-3 shadow-inner",
                  },
                  children,
              ),
};

// @ts-check
/** Pure display helpers for the profile header and stats. */

import { PLACEHOLDER_VALUES } from "./connectionPageHelpers";

/** @param {unknown} value */
const cleanText = (value) => {
    const text = value === null || value === undefined ? "" : String(value).trim();
    return PLACEHOLDER_VALUES.has(text.toLowerCase()) ? "" : text;
};

/**
 * @param {{ username?: string, firstname?: string, lastname?: string }} [user]
 * @returns {string} handle without the "@"; "" when nothing usable exists
 */
export const getProfileHandle = (user = {}) => {
    if (user.username) return user.username;
    // The /profile API has no username, so build the same-looking handle from the name
    return [user.firstname, user.lastname].filter(Boolean).join("_").replace(/\s+/g, "").toLowerCase();
};

/**
 * @param {{ description?: unknown }} [expertise]
 * @returns {string} the professional title, or "" for a missing / placeholder value
 */
export const getProfileHeadline = (expertise) => cleanText(expertise?.description);

/**
 * Skill names from an expertise skills array whose items are strings or { name } / { title } objects.
 * @param {unknown} skills
 * @returns {string[]}
 */
export const getSkillLabels = (skills) => {
    if (!Array.isArray(skills)) return [];
    return skills
        .map((skill) => cleanText(typeof skill === "object" && skill ? (skill.name ?? skill.title) : skill))
        .filter(Boolean);
};

/**
 * @param {string | number | Date | undefined | null} createdAt
 * @returns {string} e.g. "Mar 2024", or "" when the date is missing or invalid
 */
export const formatJoinedDate = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/**
 * 950 -> "950", 1200 -> "1.2k", 2500000 -> "2.5M".
 * @param {unknown} value
 * @returns {string}
 */
export const formatCompactCount = (value) => {
    const count = Number(value) || 0;
    // Round down so 999,999 reads "999.9k", never "1000k"
    /** @param {number} divisor @param {string} suffix */
    const compact = (divisor, suffix) => `${Math.floor((count / divisor) * 10) / 10}${suffix}`;
    if (count >= 1_000_000) return compact(1_000_000, "M");
    if (count >= 1_000) return compact(1_000, "k");
    return String(count);
};

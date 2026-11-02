// @ts-check
/** Pure display helpers for the smart-connections page: profile-strength nudge, badge colours, panel titles. */

const PLACEHOLDER_VALUES = new Set(["", "****", "professional seeker", "n/a", "na", "null", "undefined"]);

/**
 * Expertise fields the helpers read. Values come from user input, so any of them may be missing or a placeholder.
 * @typedef {object} ExpertiseFields
 * @property {unknown} [skills] array or a comma / pipe / newline separated string
 * @property {unknown} [interests] array or a separated string
 * @property {unknown} [description]
 * @property {unknown} [aboutYou]
 * @property {unknown} [experience]
 * @property {unknown} [name]
 * @property {unknown} [projects]
 * @property {unknown} [achievements]
 */

/** @param {unknown} value */
const normalizeText = (value) => (value === null || value === undefined ? "" : String(value).trim());

/** @param {unknown} value */
const isMeaningfulText = (value) => {
    const normalized = normalizeText(value);
    return Boolean(normalized) && !PLACEHOLDER_VALUES.has(normalized.toLowerCase());
};

/**
 * Splits a list field into unique, non-placeholder terms (case-insensitive).
 * @param {unknown} value
 * @returns {string[]}
 */
const normalizeTerms = (value) => {
    const rawItems = Array.isArray(value) ? value : normalizeText(value).split(/[,|\n;/]+/);
    const seen = new Set();
    return rawItems
        .map((item) => normalizeText(item))
        .filter((item) => isMeaningfulText(item) && !seen.has(item.toLowerCase()) && seen.add(item.toLowerCase()));
};

/**
 * Rough 0..1 score of how complete a profile is.
 * @param {ExpertiseFields} [expertise]
 * @returns {{ qualityScore: number }}
 */
const getProfileSignal = (expertise = {}) => {
    const skills = normalizeTerms(expertise.skills);
    const interests = normalizeTerms(expertise.interests);
    const headline =
        [expertise.description, expertise.aboutYou, expertise.experience, expertise.name].find(isMeaningfulText) || "";
    const textFields = [
        expertise.description,
        expertise.aboutYou,
        expertise.experience,
        expertise.projects,
        expertise.achievements,
    ].filter(isMeaningfulText);
    const qualityScore =
        (headline ? 0.32 : 0) +
        Math.min(skills.length, 5) * 0.09 +
        Math.min(interests.length, 4) * 0.06 +
        Math.min(textFields.length, 4) * 0.08;
    return { qualityScore };
};

/**
 * Message asking the viewer to complete a thin profile, or null when it is complete enough.
 * @param {ExpertiseFields} [expertise]
 * @returns {string|null}
 */
export const getViewerProfileNudge = (expertise = {}) => {
    const signal = getProfileSignal(expertise);
    if (signal.qualityScore >= 0.42) return null;
    return "Complete your profile to improve the strength of your recommendations.";
};

/**
 * Tailwind classes for the match-confidence badge.
 * @param {string} [confidence] e.g. "High confidence"
 * @returns {string}
 */
export const getConfidenceBadgeClass = (confidence = "") => {
    if (confidence.toLowerCase().includes("low")) return "text-amber-200/95 bg-amber-400/10 border-amber-400/25";
    if (confidence.toLowerCase().includes("high") || confidence.toLowerCase().includes("strong"))
        return "text-emerald-300/90 bg-emerald-400/10 border-emerald-400/20";
    return "text-cyan-200/90 bg-cyan-400/10 border-cyan-400/20";
};

/**
 * Heading for a history section.
 * @param {string|null} action
 * @returns {string}
 */
export const formatSectionTitle = (action) => {
    switch (action) {
        case "shown":
            return "Shown Profiles";
        case "saved":
            return "Saved Profiles";
        case "ignored":
            return "Ignored Profiles";
        case "interested":
            return "Interested Profiles";
        case "my_interest":
            return "My Current Interest";
        case "not_preferred":
            return "Not Preferred";
        default:
            return "Profiles";
    }
};

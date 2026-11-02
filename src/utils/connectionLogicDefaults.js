// @ts-check
/** Pure helpers for useConnectionLogic: empty insight payloads and panel <-> URL segment mapping. */

/** @typedef {Array<Record<string, any>>} Records profile / event rows as the API returns them */
/** @typedef {"dashboard" | "history" | "saved"} ConnectionPanel */

// Factories (not shared constants) so every fallback is a fresh object, as before.
export const createEmptyHistoryData = () => ({
    counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
    conversion: { interestRate: 0, saveRate: 0 },
    sections: {
        shown: /** @type {Records} */ ([]),
        saved: /** @type {Records} */ ([]),
        ignored: /** @type {Records} */ ([]),
        interested: /** @type {Records} */ ([]),
    },
    timeline: /** @type {Records} */ ([]),
    totalEvents: 0,
});

export const createEmptyPreferencesData = () => ({
    interested: /** @type {Records} */ ([]),
    notInterested: /** @type {Records} */ ([]),
    counts: { interested: 0, notInterested: 0 },
});

export const createEmptyAnalyticsData = () => ({
    counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
    conversion: { interestRate: 0, saveRate: 0 },
    deliveryBreakdown: {},
    selectionModeBreakdown: {},
    confidenceBreakdown: {},
    profileQualityBreakdown: {},
    sourceBreakdown: {},
    diversityBreakdown: { clusters: {}, profileTypes: {}, locations: {}, backgrounds: {} },
    trend: /** @type {Records} */ ([]),
    funnel: { shown: 0, saved: 0, ignored: 0, interested: 0 },
    uniqueCandidates: 0,
    sampleSize: 0,
});

export const createEmptyAdminAnalytics = () => ({
    ...createEmptyAnalyticsData(),
    activeUsers: 0,
    totalUsers: 0,
    coverageRate: 0,
});

/**
 * @param {string | undefined} urlPanel the `:panel` route segment
 * @returns {ConnectionPanel | null}
 */
export const getPanelFromUrl = (urlPanel) => {
    if (urlPanel === "recomendation=true") return "dashboard";
    if (urlPanel === "history=true") return "history";
    if (urlPanel === "saved=true") return "saved";
    return null;
};

/**
 * @param {ConnectionPanel | null} internalPanel
 * @returns {string | null}
 */
export const getUrlFromPanel = (internalPanel) => {
    if (internalPanel === "dashboard") return "recomendation=true";
    if (internalPanel === "history") return "history=true";
    if (internalPanel === "saved") return "saved=true";
    return null;
};

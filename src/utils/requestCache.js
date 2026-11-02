/*
 * A short-lived in-memory cache for reads that several screens ask for again and again
 * (people suggestions, trending hashtags, hover cards). A cached answer is reused for `maxAgeMs`,
 * and callers that ask while a request is in flight share it instead of sending their own.
 * A failed request is not cached. UserContext clears everything when the account changes.
 */
const entries = new Map();

/**
 * @template T
 * @param {string} key what is being loaded, e.g. "hover-card:<userId>"
 * @param {() => Promise<T>} load sends the request
 * @param {number} maxAgeMs how long an answer stays fresh
 * @returns {Promise<T>}
 */
export const cachedRequest = (key, load, maxAgeMs) => {
    const entry = entries.get(key);
    if (entry && Date.now() - entry.time < maxAgeMs) return entry.promise;

    const promise = load();
    entries.set(key, { promise, time: Date.now() });
    promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key);
    });
    return promise;
};

/**
 * Forgets cached answers whose key starts with `prefix` (after an action that changes them,
 * e.g. sending a connection request changes the hover card's status).
 * @param {string} prefix
 */
export const invalidateCachedRequests = (prefix) => {
    for (const key of entries.keys()) {
        if (key.startsWith(prefix)) entries.delete(key);
    }
};

/** Forgets everything (logout, another account). */
export const clearRequestCache = () => entries.clear();

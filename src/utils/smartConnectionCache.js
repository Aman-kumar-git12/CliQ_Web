// @ts-check
import * as connectionsApi from "../api/connections";

const CACHE_PREFIX = "smart_connections_batch_v1";
const MAX_CACHE_USERS = 10;

const isBrowser = () => typeof window !== "undefined";

/** @typedef {import("../api/connections").SmartCandidate} SmartCandidate */

/** @param {string} userId */
const getCacheKey = (userId) => `${CACHE_PREFIX}:${userId}`;

/**
 * Cached suggestion batch for this user (this tab only), or [].
 * @param {string | null | undefined} userId
 * @returns {SmartCandidate[]}
 */
export const readSmartConnectionsCache = (userId) => {
    if (!isBrowser() || !userId) return [];

    try {
        const raw = window.sessionStorage.getItem(getCacheKey(userId));
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.users)) return [];

        return parsed.users.filter((/** @type {SmartCandidate} */ candidate) => candidate?.id);
    } catch (error) {
        console.error("Failed to read smart connection cache:", error);
        return [];
    }
};

/**
 * @param {string | null | undefined} userId
 * @param {SmartCandidate[]} [users]
 */
export const writeSmartConnectionsCache = (userId, users = []) => {
    if (!isBrowser() || !userId) return;

    try {
        const normalizedUsers = users.filter((candidate) => candidate?.id).slice(0, MAX_CACHE_USERS);

        window.sessionStorage.setItem(
            getCacheKey(userId),
            JSON.stringify({
                users: normalizedUsers,
                cachedAt: Date.now(),
            }),
        );
    } catch (error) {
        console.error("Failed to write smart connection cache:", error);
    }
};

/**
 * Fetches a fresh batch in the background so the connections page opens instantly.
 * @param {{ userId?: string | null, refresh?: boolean }} [options]
 * @returns {Promise<SmartCandidate[]>}
 */
export const warmSmartConnectionsCache = async ({ userId, refresh = false } = {}) => {
    if (!userId) return [];

    try {
        const params = refresh ? "?refresh=true" : "";
        const data = await connectionsApi.getSmartUsers(params);
        const users = Array.isArray(data) ? data : [];
        if (users.length > 0) {
            writeSmartConnectionsCache(userId, users);
        }
        return users;
    } catch (error) {
        console.error("Failed to warm smart connection cache:", error);
        return [];
    }
};

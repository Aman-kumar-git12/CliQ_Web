import axiosClient from "../api/axiosClient";

const CACHE_PREFIX = "smart_connections_batch_v1";
const MAX_CACHE_USERS = 10;

const isBrowser = () => typeof window !== "undefined";

const getCacheKey = (userId) => `${CACHE_PREFIX}:${userId}`;

export const readSmartConnectionsCache = (userId) => {
    if (!isBrowser() || !userId) return [];

    try {
        const raw = window.sessionStorage.getItem(getCacheKey(userId));
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.users)) return [];

        return parsed.users.filter((candidate) => candidate?.id);
    } catch (error) {
        console.error("Failed to read smart connection cache:", error);
        return [];
    }
};

export const writeSmartConnectionsCache = (userId, users = []) => {
    if (!isBrowser() || !userId) return;

    try {
        const normalizedUsers = users
            .filter((candidate) => candidate?.id)
            .slice(0, MAX_CACHE_USERS);

        window.sessionStorage.setItem(
            getCacheKey(userId),
            JSON.stringify({
                users: normalizedUsers,
                cachedAt: Date.now(),
            })
        );
    } catch (error) {
        console.error("Failed to write smart connection cache:", error);
    }
};

export const warmSmartConnectionsCache = async ({ userId, refresh = false } = {}) => {
    if (!userId) return [];

    try {
        const params = refresh ? "?refresh=true" : "";
        const response = await axiosClient.get(`/request/smart-users${params}`);
        const users = Array.isArray(response.data) ? response.data : [];
        if (users.length > 0) {
            writeSmartConnectionsCache(userId, users);
        }
        return users;
    } catch (error) {
        console.error("Failed to warm smart connection cache:", error);
        return [];
    }
};

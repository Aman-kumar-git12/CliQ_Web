import axios from "axios";
import { showErrorToast } from "../utils/toast";

const pro = import.meta.env.VITE_BACKEND_URL;
export const apiBaseUrl = (pro || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");

// UserContext listens for this and sends the user to login
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

/**
 * Axios config accepted by every service function in src/api. `silent: true` stops the
 * interceptor below from showing an error toast (for screens that show their own message).
 * @typedef {import("axios").AxiosRequestConfig & { silent?: boolean }} RequestConfig
 */

const MAX_READ_RETRIES = 2;
const RETRY_DELAY_MS = 3000;
const READ_METHODS = ["get", "head", "options"];
// These answer 401 as part of their normal flow (wrong password, not logged in yet), not because a session ended
const AUTH_FLOW_PATHS = ["/login", "/signup", "/auth/"];

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // send the auth cookie with every request
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
 * Sessions: the access cookie lasts 15 minutes and a sign-in lasts 7 days. When a request comes back
 * 401 with code TOKEN_EXPIRED, POST /auth/refresh swaps the refresh cookie for a new access cookie and
 * the request is sent again. Every request that expires at the same moment waits for the same single
 * renewal. Only the server saying no (401) ends the session; if the server can't be reached (it is
 * restarting, or waking up on Render) the renewal is retried and the user stays logged in.
 */
let refreshInFlight = null;

/** @typedef {"renewed" | "ended" | "unreachable"} RefreshResult */

/** @returns {Promise<RefreshResult>} */
const attemptRefresh = async () => {
    for (let attempt = 1; ; attempt++) {
        try {
            await axiosClient.post("/auth/refresh", null, /** @type {RequestConfig} */ ({ silent: true }));
            return "renewed";
        } catch (error) {
            if (error.response?.status === 401) return "ended";
            if (attempt > MAX_READ_RETRIES) return "unreachable";
            await wait(RETRY_DELAY_MS * attempt);
        }
    }
};

/** @returns {Promise<RefreshResult>} */
export const refreshSession = () => {
    if (!refreshInFlight) {
        refreshInFlight = attemptRefresh().finally(() => {
            refreshInFlight = null;
        });
    }
    return refreshInFlight;
};

const endSessionIf = (result) => {
    if (result === "ended") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

const isTokenExpired = (status, data) => status === 401 && data?.code === "TOKEN_EXPIRED";

/**
 * fetch() for the streaming endpoints (axios can't stream in the browser): sends the cookies and,
 * like the axios client, renews an expired session once and retries.
 * @param {string} url
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
export const fetchWithSession = async (url, init = {}) => {
    const send = () => fetch(url, { credentials: "include", ...init });
    const response = await send();
    if (response.status !== 401) return response;
    const body = await response
        .clone()
        .json()
        .catch(() => null);
    if (!isTokenExpired(401, body)) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        return response;
    }
    const result = await refreshSession();
    if (result === "renewed") return send();
    endSessionIf(result);
    return response;
};

const describeError = (error) => {
    if (!error.response) return "Can't reach CliQ right now. Check your connection and try again.";
    return error.response.data?.message || "Something went wrong. Please try again.";
};

/*
 * Every failed request passes through here:
 * - reads with no response (cold start, network blip) are retried a couple of times; writes are not,
 *   because a write may already have reached the server and retrying it could duplicate a post or message
 * - a 401 with code TOKEN_EXPIRED renews the session and resends the request (see refreshSession);
 *   if the server can't be reached for the renewal, the request fails but the user stays logged in
 * - any other 401 outside the login/signup flow means the session ended, so the app logs the user out
 * - anything else shows a toast, unless the caller passed { silent: true } because it shows its own message.
 *   Reads that fail with 4xx stay quiet: pages show their own "not found" or empty state.
 */
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isCancel(error)) return Promise.reject(error);

        const config = error.config || {};
        const method = (config.method || "get").toLowerCase();
        const isRead = READ_METHODS.includes(method);

        const retries = config._retryCount || 0;
        if (!error.response && isRead && retries < MAX_READ_RETRIES) {
            config._retryCount = retries + 1;
            await wait(RETRY_DELAY_MS * config._retryCount);
            return axiosClient(config);
        }

        const status = error.response?.status;
        if (isTokenExpired(status, error.response?.data) && !config._sessionRenewed) {
            config._sessionRenewed = true;
            const result = await refreshSession();
            if (result === "renewed") return axiosClient(config);
            endSessionIf(result);
            if (result === "unreachable" && !config.silent) showErrorToast(describeError({}));
            return Promise.reject(error);
        }
        if (status === 401) {
            if (!AUTH_FLOW_PATHS.some((path) => (config.url || "").startsWith(path))) {
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
            }
            return Promise.reject(error);
        }

        const quietRead = isRead && status && status < 500;
        if (!config.silent && !quietRead) showErrorToast(describeError(error));
        return Promise.reject(error);
    },
);

export default axiosClient;

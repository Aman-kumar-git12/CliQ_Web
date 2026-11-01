/*
 * Connections: connection lists and status, sending and reviewing requests,
 * and the smart-users recommendations (Get Connections) with their history, saves, preferences and analytics.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

/**
 * Returns the logged-in user's connections.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ connections: object[] }>}
 */
export const getMyConnections = async (config) => (await axiosClient.get("/user/connections", config)).data;

/**
 * Returns the connection between the logged-in user and another user.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ status?: string, connection?: object }>}
 */
export const getConnectionStatus = async (userId, config) =>
    (await axiosClient.get(`/user/connections/${userId}`, config)).data;

/**
 * Returns another user's public connections.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ connections: object[] }>}
 */
export const getPublicConnections = async (userId, config) =>
    (await axiosClient.get(`/user/public/connections/${userId}`, config)).data;

/**
 * Removes the connection record with a user (e.g. an old "ignored" swipe).
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const cancelConnection = async (userId, config) =>
    (await axiosClient.delete(`/user/connections/cancel/${userId}`, config)).data;

/**
 * Returns the connection requests sent to the logged-in user.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ connectionRequests?: object[] }>}
 */
export const getConnectionRequests = async (config) => (await axiosClient.get("/user/requests", config)).data;

/**
 * Accepts or rejects a connection request.
 * @param {"accepted" | "rejected"} status
 * @param {string} requestId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const reviewConnectionRequest = async (status, requestId, config) =>
    (await axiosClient.post(`/request/review/${status}/${requestId}`, {}, config)).data;

/**
 * Sends a connection request ("interested") or records a skip ("ignored").
 * @param {string} userId
 * @param {"interested" | "ignored"} [status]
 * @param {{ source?: string }} [body] optional tracking info
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const sendConnectionRequest = async (userId, status = "interested", body, config) =>
    (await axiosClient.post(`/request/send/${status}/${userId}`, body, config)).data;

/**
 * Returns a batch of recommended users.
 * @param {string} [search] query string including the leading "?" (e.g. "?refresh=true"), or ""
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getSmartUsers = async (search = "", config) =>
    (await axiosClient.get(`/request/smart-users${search}`, config)).data;

/**
 * Returns the recommendation history (counts, sections, timeline).
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const getSmartUsersHistory = async (config) =>
    (await axiosClient.get("/request/smart-users/history", config)).data;

/**
 * Returns the profiles saved for later.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ savedProfiles?: object[] }>}
 */
export const getSavedProfiles = async (config) => (await axiosClient.get("/request/smart-users/saved", config)).data;

/**
 * Returns the users marked as Preferred.
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getPreferredUsers = async (config) =>
    (await axiosClient.get("/request/preferences/interested", config)).data;

/**
 * Returns the users marked as Not Preferred.
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getNotPreferredUsers = async (config) =>
    (await axiosClient.get("/request/preferences/not-interested", config)).data;

/**
 * Returns the logged-in user's recommendation analytics.
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const getSmartUsersAnalytics = async (config) =>
    (await axiosClient.get("/request/smart-users/analytics", config)).data;

/**
 * Returns platform-wide recommendation analytics (admins only).
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const getAdminAnalytics = async (config) =>
    (await axiosClient.get("/request/smart-users/admin-analytics", config)).data;

/**
 * Records that a recommended user was shown.
 * @param {string} userId
 * @param {object} body source and metadata
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const trackProfileShown = async (userId, body, config) =>
    (await axiosClient.post(`/request/smart-users/shown/${userId}`, body, config)).data;

/**
 * Marks a recommended user as Preferred.
 * @param {string} userId
 * @param {{ source: string }} body
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message?: string }>}
 */
export const markPreferred = async (userId, body, config) =>
    (await axiosClient.post(`/request/smart-users/interest/${userId}`, body, config)).data;

/**
 * Marks a recommended user as Not Preferred.
 * @param {string} userId
 * @param {{ source: string }} body
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message?: string }>}
 */
export const markNotPreferred = async (userId, body, config) =>
    (await axiosClient.post(`/request/smart-users/not-interest/${userId}`, body, config)).data;

/**
 * Saves a recommended user for later.
 * @param {string} userId
 * @param {{ source: string }} body
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const saveProfile = async (userId, body, config) =>
    (await axiosClient.post(`/request/smart-users/save/${userId}`, body, config)).data;

/**
 * Removes a user from the saved-for-later list.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const removeSavedProfile = async (userId, config) =>
    (await axiosClient.delete(`/request/smart-users/save/${userId}`, config)).data;

/**
 * Clears one section of the recommendation history.
 * @param {string} section
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const resetHistorySection = async (section, config) =>
    (await axiosClient.delete(`/request/smart-users/section/reset/${section}`, config)).data;

/**
 * Removes one user from a section of the recommendation history.
 * @param {string} action section name
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const removeHistorySectionItem = async (action, userId, config) =>
    (await axiosClient.delete(`/request/smart-users/section/${action}/${userId}`, config)).data;

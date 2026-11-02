/*
 * Users and profiles: the logged-in user's profile and expertise, other users' profiles,
 * hover cards, people suggestions and @mention suggestions.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" };

/**
 * Returns the logged-in user's full profile.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user: object }>}
 */
export const getMyProfile = async (config) => (await axiosClient.get("/profile", config)).data;

/**
 * Saves the edit-profile form.
 * @param {object} form profile fields
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const updateProfile = async (form, config) => (await axiosClient.put("/profile/edit", form, config)).data;

/**
 * Uploads a new profile picture (multipart, field "image").
 * @param {FormData} formData
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message?: string, imageUrl: string }>}
 */
export const updateProfileImage = async (formData, config) =>
    (
        await axiosClient.put("/profile/image", formData, {
            ...config,
            headers: { ...MULTIPART_HEADERS, ...config?.headers },
        })
    ).data;

/**
 * Saves the user's expertise section.
 * @param {object} expertise expertise fields plus `format`
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const updateExpertise = async (expertise, config) =>
    (await axiosClient.put("/profile/expertise", expertise, config)).data;

/**
 * Generates an expertise section with AI from the user's answers.
 * @param {object} answers questionnaire answers
 * @param {RequestConfig} [config]
 * @returns {Promise<{ expertise: object, generation_source?: string }>}
 */
export const generateAiExpertise = async (answers, config) =>
    (await axiosClient.post("/generate-ai-expertise", { answers }, config)).data;

/**
 * Starts an email change: the server emails a 6-digit code to the new address. Nothing changes yet.
 * @param {{ newEmail: string, currentPassword: string }} payload
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message: string }>}
 */
export const requestEmailChange = async (payload, config) =>
    (await axiosClient.post("/profile/email/change", payload, config)).data;

/**
 * Confirms an email change with the code sent to the new address; other browsers are signed out.
 * @param {string} otp
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message: string, user: object }>}
 */
export const confirmEmailChange = async (otp, config) =>
    (await axiosClient.post("/profile/email/confirm", { otp }, config)).data;

/**
 * Downloads everything the account holds as one JSON object.
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const exportMyData = async (config) => (await axiosClient.get("/profile/export", config)).data;

/**
 * Permanently deletes the logged-in user's account.
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteAccount = async (config) => (await axiosClient.delete(`/profile/delete`, config)).data;

/**
 * Returns another user's public profile.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user: object }>}
 */
export const getUser = async (userId, config) => (await axiosClient.get(`/user/${userId}`, config)).data;

/**
 * Returns the compact profile shown in a hover card, including the connection status.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ connectionStatus: string } & object>}
 */
export const getHoverCard = async (userId, config) =>
    (await axiosClient.get(`/user/hover-card/${userId}`, config)).data;

/**
 * Returns suggested people to connect with.
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getSuggestedUsers = async (config) => (await axiosClient.get("/user/search/suggested", config)).data;

/**
 * Returns users matching a partial @mention.
 * @param {string} query text typed after "@"
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getMentionSuggestions = async (query, config) =>
    (await axiosClient.get("/user/mention-suggestions", { ...config, params: { q: query } })).data;

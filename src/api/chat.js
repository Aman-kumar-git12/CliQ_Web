// @ts-check
/*
 * Direct messages: conversations, history, file uploads, editing and deleting messages, public groups,
 * and the message assistant (/message-ai): reply suggestions plus reply and Ask AI history.
 * Real-time sending goes over the socket (src/api/socket.js), not here.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" };

/**
 * Returns the logged-in user's conversations for the inbox.
 * @param {RequestConfig} [config]
 * @returns {Promise<object[] | { conversations: object[] }>}
 */
export const getConversations = async (config) => (await axiosClient.get("/chat/conversations", config)).data;

/**
 * Returns the messages exchanged with a user.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getChatHistory = async (userId, config) => (await axiosClient.get(`/chat/history/${userId}`, config)).data;

/**
 * Uploads a chat attachment or voice message (multipart, field "file").
 * @param {FormData} formData
 * @param {RequestConfig} [config]
 * @returns {Promise<{ url: string, type?: string, originalName?: string }>}
 */
export const uploadChatFile = async (formData, config) =>
    (
        await axiosClient.post("/chat/upload", formData, {
            ...config,
            headers: { ...MULTIPART_HEADERS, ...config?.headers },
        })
    ).data;

/**
 * Edits a message's text or soft-deletes it for everyone.
 * @param {string} messageId
 * @param {{ text?: string, isDelete?: boolean }} changes
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const updateChatMessage = async (messageId, changes, config) =>
    (await axiosClient.put(`/chat/message/${messageId}`, changes, config)).data;

/**
 * Deletes a message for the logged-in user only.
 * @param {string} messageId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteChatMessage = async (messageId, config) =>
    (await axiosClient.delete(`/chat/message/${messageId}`, config)).data;

/**
 * Deletes several messages at once.
 * @param {string[]} messageIds
 * @param {"me" | "everyone"} deleteType
 * @param {RequestConfig} [config]
 * @returns {Promise<{ success: boolean }>}
 */
export const deleteChatMessages = async (messageIds, deleteType, config) =>
    (await axiosClient.post("/chat/delete-bulk", { messageIds, deleteType }, config)).data;

/**
 * Returns the public groups a user belongs to.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ groups: object[] }>}
 */
export const getPublicGroups = async (userId, config) =>
    (await axiosClient.get(`/chat/public/groups/${userId}`, config)).data;

/**
 * Generates reply suggestions for the conversation with a user.
 * @param {string} userId
 * @param {{ mode: string, draft?: string, tone?: string, emojiPreference?: string }} request
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const getReplySuggestions = async (userId, request, config) =>
    (await axiosClient.post(`/message-ai/conversation/${userId}`, request, config)).data;

/**
 * Returns the saved reply-assistant history for a conversation.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ history?: object[] }>}
 */
export const getReplyHistory = async (userId, config) =>
    (await axiosClient.get(`/message-ai/history/${userId}`, config)).data;

/**
 * Saves a reply-assistant result to the conversation's history.
 * @param {string} userId
 * @param {object} entry
 * @param {RequestConfig} [config]
 * @returns {Promise<{ history?: object }>}
 */
export const saveReplyHistory = async (userId, entry, config) =>
    (await axiosClient.post(`/message-ai/history/${userId}`, entry, config)).data;

/**
 * Clears the reply-assistant history for a conversation.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const clearReplyHistory = async (userId, config) =>
    (await axiosClient.delete(`/message-ai/history/${userId}`, config)).data;

/**
 * Deletes one reply-assistant history entry.
 * @param {string} userId
 * @param {string} historyId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteReplyHistoryItem = async (userId, historyId, config) =>
    (await axiosClient.delete(`/message-ai/history/${userId}/${historyId}`, config)).data;

/**
 * Returns the saved Ask AI history for a conversation.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ history?: object[] }>}
 */
export const getAskHistory = async (userId, config) =>
    (await axiosClient.get(`/message-ai/ask-history/${userId}`, config)).data;

/**
 * Saves an Ask AI exchange to the conversation's history.
 * @param {string} userId
 * @param {object} entry
 * @param {RequestConfig} [config]
 * @returns {Promise<{ history?: object }>}
 */
export const saveAskHistory = async (userId, entry, config) =>
    (await axiosClient.post(`/message-ai/ask-history/${userId}`, entry, config)).data;

/**
 * Clears the Ask AI history for a conversation.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const clearAskHistory = async (userId, config) =>
    (await axiosClient.delete(`/message-ai/ask-history/${userId}`, config)).data;

/**
 * Deletes one Ask AI history entry.
 * @param {string} userId
 * @param {string} historyId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteAskHistoryItem = async (userId, historyId, config) =>
    (await axiosClient.delete(`/message-ai/ask-history/${userId}/${historyId}`, config)).data;

// @ts-check
/*
 * CliQ AI help chatbot: sessions, history and answer feedback.
 * Answers themselves stream over SSE with fetch in Chatbot.jsx, not through these functions.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

/**
 * Returns the user's chatbot sessions, newest first.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ sessions?: object[] }>}
 */
export const getAiChatSessions = async (config) => (await axiosClient.get("/aichat/sessions", config)).data;

/**
 * Creates an empty chatbot session.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ session: object }>}
 */
export const createAiChatSession = async (config) =>
    (await axiosClient.post("/aichat/session", undefined, config)).data;

/**
 * Returns the messages of a chatbot session.
 * @param {string} sessionId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ messages?: object[] }>}
 */
export const getAiChatHistory = async (sessionId, config) =>
    (await axiosClient.get(`/aichat/history/${sessionId}`, config)).data;

/**
 * Deletes one chatbot session.
 * @param {string} sessionId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteAiChatSession = async (sessionId, config) =>
    (await axiosClient.delete(`/aichat/session/${sessionId}`, config)).data;

/**
 * Deletes all of the user's chatbot sessions.
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deleteAllAiChatSessions = async (config) =>
    (await axiosClient.delete(`/aichat/sessions/all`, config)).data;

/**
 * Records thumbs up/down feedback on a chatbot answer.
 * @param {string} messageId
 * @param {{ feedback: string | null, note?: string }} feedback
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const sendAiMessageFeedback = async (messageId, feedback, config) =>
    (await axiosClient.patch(`/aichat/message/${messageId}/feedback`, feedback, config)).data;

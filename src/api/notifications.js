// @ts-check
/*
 * Notifications: paged list, marking as read and deleting.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

/**
 * Returns a page of notifications plus the unread count.
 * @param {{ limit?: number, cursor?: string }} params
 * @param {RequestConfig} [config]
 * @returns {Promise<{ notifications?: object[], unreadCount?: number, nextCursor?: string | null }>}
 */
export const getNotifications = async (params, config) =>
    (await axiosClient.get("/notifications", { ...config, params })).data;

/**
 * Marks one notification as read.
 * @param {string} notificationId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ unreadCount?: number }>}
 */
export const markNotificationRead = async (notificationId, config) =>
    (await axiosClient.patch(`/notifications/${notificationId}/read`, undefined, config)).data;

/**
 * Marks every notification as read.
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const markAllNotificationsRead = async (config) =>
    (await axiosClient.patch("/notifications/read-all", undefined, config)).data;

/**
 * Deletes one notification.
 * @param {string} notificationId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ unreadCount?: number }>}
 */
export const deleteNotification = async (notificationId, config) =>
    (await axiosClient.delete(`/notifications/${notificationId}`, config)).data;

/*
 * Search: the search page results and trending hashtags.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

/**
 * Searches people, posts and hashtags.
 * @param {string} query
 * @param {string} type result tab to search
 * @param {RequestConfig} [config]
 * @returns {Promise<object>} result lists keyed by type
 */
export const searchAll = async (query, type, config) =>
    (await axiosClient.get("/search", { ...config, params: { q: query, type } })).data;

/**
 * Returns the most-used hashtags of the last 30 days.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ hashtags?: object[] }>}
 */
export const getTrendingHashtags = async (config) => (await axiosClient.get("/search/trending-hashtags", config)).data;

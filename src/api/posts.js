// @ts-check
/*
 * Posts: creating, editing and deleting posts, comments, likes, reposts, saves, reports,
 * the Home feeds and link previews.
 * Every function returns the response body; errors propagate unchanged.
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" };

/**
 * Creates a text-only post.
 * @param {{ content: string, mentionIds?: string[] }} post
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const createPost = async (post, config) => (await axiosClient.post("/create/post", post, config)).data;

/**
 * Creates a post with an image or video (multipart).
 * @param {FormData} formData
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const createPostWithMedia = async (formData, config) =>
    (
        await axiosClient.post("/create/post", formData, {
            ...config,
            headers: { ...MULTIPART_HEADERS, ...config?.headers },
        })
    ).data;

/**
 * Returns one post (the server may wrap it in an array).
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<object | object[]>}
 */
export const getPost = async (postId, config) => (await axiosClient.get(`/user/post/${postId}`, config)).data;

/**
 * Returns all posts by a user.
 * @param {string} userId
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getUserPosts = async (userId, config) => (await axiosClient.get(`/user/posts/${userId}`, config)).data;

/**
 * Edits a post's text.
 * @param {string} postId
 * @param {{ content: string, mentionIds?: string[] }} changes
 * @param {RequestConfig} [config]
 * @returns {Promise<{ updatedPost?: object }>}
 */
export const updatePost = async (postId, changes, config) =>
    (await axiosClient.put(`/update/post/${postId}`, changes, config)).data;

/**
 * Deletes a post.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const deletePost = async (postId, config) => (await axiosClient.delete(`/delete/post/${postId}`, config)).data;

/**
 * Returns a post's comments.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getPostComments = async (postId, config) =>
    (await axiosClient.get(`/user/post/comments/${postId}`, config)).data;

/**
 * Adds a comment, or a reply when `parentId` is set.
 * @param {string} postId
 * @param {{ comment: string, parentId?: string, mentionIds?: string[] }} comment
 * @param {RequestConfig} [config]
 * @returns {Promise<object>} the created comment
 */
export const addComment = async (postId, comment, config) =>
    (await axiosClient.post(`/user/post/comments/${postId}`, comment, config)).data;

/**
 * Deletes a comment (and its replies when it is a top-level comment).
 * @param {string} commentId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ deletedCount?: number }>}
 */
export const deleteComment = async (commentId, config) =>
    (await axiosClient.delete(`/user/post/comments/${commentId}`, config)).data;

/**
 * Likes or unlikes a post.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ isLiked: boolean }>}
 */
export const togglePostLike = async (postId, config) =>
    (await axiosClient.post(`/user/post/like/${postId}`, {}, config)).data;

/**
 * Returns a post's like count.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ likesCount: number }>}
 */
export const getPostLikesCount = async (postId, config) =>
    (await axiosClient.get(`/user/post/likes/count/${postId}`, config)).data;

/**
 * Returns the users who liked a post.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<object[]>}
 */
export const getPostLikers = async (postId, config) =>
    (await axiosClient.get(`/user/post/likes/users/${postId}`, config)).data;

/**
 * Saves or unsaves a post.
 * @param {string} postId
 * @param {RequestConfig} [config]
 * @returns {Promise<{ isSaved: boolean }>}
 */
export const togglePostSave = async (postId, config) =>
    (await axiosClient.post(`/user/post/save/${postId}`, undefined, config)).data;

/**
 * Returns a page of the user's saved posts.
 * @param {string | null} [cursor] cursor from the previous page
 * @param {RequestConfig} [config]
 * @returns {Promise<{ posts: object[], nextCursor: string | null }>}
 */
export const getSavedPosts = async (cursor, config) =>
    (await axiosClient.get("/user/saved-posts", { ...config, params: cursor ? { cursor } : {} })).data;

/**
 * Reposts a post (no body) or quote-posts it (with `{ content, mentionIds }`).
 * @param {string} postId
 * @param {{ content: string, mentionIds?: string[] }} [quote]
 * @param {RequestConfig} [config]
 * @returns {Promise<{ isReposted?: boolean, repostsCount: number, post?: object }>}
 */
export const repostPost = async (postId, quote, config) =>
    (await axiosClient.post(`/user/post/repost/${postId}`, quote, config)).data;

/**
 * Reports a post.
 * @param {string} postId
 * @param {string} reason
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const reportPost = async (postId, reason, config) =>
    (await axiosClient.post(`/user/post/report/${postId}`, { reason }, config)).data;

/**
 * Reports a comment.
 * @param {string} commentId
 * @param {string} reason
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const reportComment = async (commentId, reason, config) =>
    (await axiosClient.post(`/user/comment/report/${commentId}`, { reason }, config)).data;

/**
 * Returns the next batch of the For You feed.
 * @param {string[]} excludeIds ids of posts already shown
 * @param {RequestConfig} [config]
 * @returns {Promise<{ posts: object[], hasMore: boolean }>}
 */
export const getRandomFeed = async (excludeIds, config) =>
    (await axiosClient.post("/post/feed/random", { excludeIds }, config)).data;

/**
 * Returns a page of the Following feed, newest first.
 * @param {string | null} [cursor] nextCursor from the previous page; omit for the first page
 * @param {RequestConfig} [config]
 * @returns {Promise<{ posts: object[], hasMore: boolean }>}
 */
export const getFollowingFeed = async (cursor, config) =>
    (
        await axiosClient.get(
            "/post/feed/following",
            /** @type {RequestConfig} */ ({ ...config, params: cursor ? { cursor } : {} }),
        )
    ).data;

/**
 * Returns a page of the Trending feed.
 * @param {number} page 1-based page number
 * @param {RequestConfig} [config]
 * @returns {Promise<{ posts: object[], hasMore: boolean }>}
 */
export const getTrendingFeed = async (page, config) =>
    (await axiosClient.get("/post/feed/trending", /** @type {RequestConfig} */ ({ ...config, params: { page } }))).data;

/**
 * Returns the preview card (title, image…) for a URL.
 * @param {string} url
 * @param {RequestConfig} [config]
 * @returns {Promise<{ preview?: object | null }>}
 */
export const getLinkPreview = async (url, config) =>
    (await axiosClient.get("/link-preview", /** @type {RequestConfig} */ ({ ...config, params: { url } }))).data;

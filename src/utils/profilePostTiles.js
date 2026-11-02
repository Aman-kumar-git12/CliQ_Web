// @ts-check
// Profile grids show the original for a plain repost (it has no text of its
// own) and drop reposts whose original was deleted.
/**
 * @param {Array<Record<string, any>>} [posts]
 * @returns {Array<Record<string, any>>}
 */
export const toProfileTiles = (posts = []) =>
    posts
        .map((post) => {
            if (!post.isRepost || post.isQuote) return post;
            return post.repostOf ? { ...post.repostOf, isRepostTile: true, tileKey: post.id } : null;
        })
        .filter(Boolean);

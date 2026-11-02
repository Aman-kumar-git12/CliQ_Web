/**
 * The like count after a like toggle, from the server's answer: the toggle response says whether the
 * post is now liked, so the count follows from the count before the click without a second request.
 * @param {boolean} wasLiked liked before the click
 * @param {number} countBefore like count before the click
 * @param {boolean} isLiked liked according to the server's response
 * @returns {number}
 */
export const likesCountAfterToggle = (wasLiked, countBefore, isLiked) => {
    const delta = isLiked === wasLiked ? 0 : isLiked ? 1 : -1;
    return Math.max(0, (countBefore || 0) + delta);
};

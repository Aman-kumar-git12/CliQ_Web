import { useEffect, useState } from "react";
import * as postsApi from "../api/posts";
import { useFeedContext } from "../context/FeedContext";

/**
 * Save / repost / quote / share for one post, shared by the feed card and the
 * single-post page. `post` must be the post being acted on (the original, for
 * a plain repost card). `notify(message, type)` shows feedback.
 */
export const usePostActions = (post, notify = () => {}) => {
    const { updateFeedPost } = useFeedContext();
    const [isSaved, setIsSaved] = useState(Boolean(post?.isSaved));
    const [isReposted, setIsReposted] = useState(Boolean(post?.isReposted));
    const [repostsCount, setRepostsCount] = useState(post?.repostsCount || 0);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setIsSaved(Boolean(post?.isSaved));
        setIsReposted(Boolean(post?.isReposted));
        setRepostsCount(post?.repostsCount || 0);
    }, [post?.id, post?.isSaved, post?.isReposted, post?.repostsCount]);

    const toggleSave = async () => {
        if (!post || busy) return;
        const previous = isSaved;
        setIsSaved(!previous);
        setBusy(true);
        try {
            const data = await postsApi.togglePostSave(post.id);
            setIsSaved(data.isSaved);
            updateFeedPost(post.id, { isSaved: data.isSaved });
            notify(data.isSaved ? "Saved to your bookmarks" : "Removed from saved", "success");
        } catch (err) {
            console.error("Save failed:", err);
            setIsSaved(previous);
            notify("Couldn't update saved posts", "error");
        } finally {
            setBusy(false);
        }
    };

    const toggleRepost = async () => {
        if (!post || busy) return;
        const previous = { isReposted, repostsCount };
        setIsReposted(!isReposted);
        setRepostsCount((c) => Math.max(0, c + (isReposted ? -1 : 1)));
        setBusy(true);
        try {
            const data = await postsApi.repostPost(post.id);
            setIsReposted(data.isReposted);
            setRepostsCount(data.repostsCount);
            updateFeedPost(post.id, { isReposted: data.isReposted, repostsCount: data.repostsCount });
            notify(data.isReposted ? "Reposted" : "Repost removed", "success");
        } catch (err) {
            console.error("Repost failed:", err);
            setIsReposted(previous.isReposted);
            setRepostsCount(previous.repostsCount);
            notify("Couldn't repost", "error");
        } finally {
            setBusy(false);
        }
    };

    const quote = async (content, mentionIds = []) => {
        const data = await postsApi.repostPost(post.id, { content, mentionIds });
        setRepostsCount(data.repostsCount);
        updateFeedPost(post.id, { repostsCount: data.repostsCount });
        notify("Quote posted", "success");
        return data.post;
    };

    const share = async () => {
        if (!post) return;
        const url = `${window.location.origin}/post/${post.id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: `Post by ${post.username}`, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            notify("Link copied to clipboard", "success");
        } catch (err) {
            // The user closing the share sheet isn't an error.
            if (err?.name !== "AbortError") notify("Couldn't share this post", "error");
        }
    };

    return { isSaved, isReposted, repostsCount, busy, toggleSave, toggleRepost, quote, share };
};

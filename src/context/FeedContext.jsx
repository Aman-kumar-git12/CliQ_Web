import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useUserContext } from "./UserContext";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [feedPage, setFeedPage] = useState(1);
    const [feedHasMore, setFeedHasMore] = useState(true);
    // The Home scroll position is only read when Home mounts again, so it lives in a ref: as state, every
    // scroll event re-rendered every PostCard (they all read this context)
    const feedScrollYRef = useRef(0);

    // A different account (logout, then login in the same tab) must not see the previous account's feed
    const userId = useUserContext()?.user?.id ?? null;
    const [feedOwnerId, setFeedOwnerId] = useState(userId);
    if (feedOwnerId !== userId) {
        setFeedOwnerId(userId);
        setFeedPosts([]);
        setFeedPage(1);
        setFeedHasMore(true);
        feedScrollYRef.current = 0;
    }

    // Also patches copies of the post embedded in reposts (post.repostOf).
    const updateFeedPost = useCallback((postId, updatesOrFn) => {
        const apply = (post) => {
            const updates = typeof updatesOrFn === "function" ? updatesOrFn(post) : updatesOrFn;
            return { ...post, ...updates };
        };
        setFeedPosts((prev) =>
            prev.map((post) => {
                if (post.id === postId) return apply(post);
                if (post.repostOf?.id === postId) return { ...post, repostOf: apply(post.repostOf) };
                return post;
            }),
        );
    }, []);

    const value = useMemo(
        () => ({
            feedPosts,
            setFeedPosts,
            feedPage,
            setFeedPage,
            feedHasMore,
            setFeedHasMore,
            feedScrollYRef,
            updateFeedPost,
        }),
        [feedPosts, feedPage, feedHasMore, updateFeedPost],
    );

    return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeedContext = () => useContext(FeedContext);

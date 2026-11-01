import { createContext, useContext, useState } from "react";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [feedPage, setFeedPage] = useState(1);
    const [feedHasMore, setFeedHasMore] = useState(true);
    const [feedScrollY, setFeedScrollY] = useState(0);

    // Also patches copies of the post embedded in reposts (post.repostOf).
    const updateFeedPost = (postId, updatesOrFn) => {
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
    };

    return (
        <FeedContext.Provider
            value={{
                feedPosts,
                setFeedPosts,
                feedPage,
                setFeedPage,
                feedHasMore,
                setFeedHasMore,
                feedScrollY,
                setFeedScrollY,
                updateFeedPost, // Expose this
            }}
        >
            {children}
        </FeedContext.Provider>
    );
};

export const useFeedContext = () => useContext(FeedContext);

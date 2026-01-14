import { createContext, useContext, useState } from "react";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [feedPage, setFeedPage] = useState(1);
    const [feedHasMore, setFeedHasMore] = useState(true);
    const [feedScrollY, setFeedScrollY] = useState(0);

    const updateFeedPost = (postId, updatesOrFn) => {
        setFeedPosts(prev => prev.map(post => {
            if (post.id !== postId) return post;
            const updates = typeof updatesOrFn === 'function' ? updatesOrFn(post) : updatesOrFn;
            return { ...post, ...updates };
        }));
    };

    return (
        <FeedContext.Provider value={{
            feedPosts, setFeedPosts,
            feedPage, setFeedPage,
            feedHasMore, setFeedHasMore,
            feedScrollY, setFeedScrollY,
            updateFeedPost // Expose this
        }}>
            {children}
        </FeedContext.Provider>
    );
};

export const useFeedContext = () => useContext(FeedContext);

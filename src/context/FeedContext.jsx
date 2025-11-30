import  { createContext, useContext, useState } from "react";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [feedPage, setFeedPage] = useState(1);
    const [feedHasMore, setFeedHasMore] = useState(true);
    const [feedScrollY, setFeedScrollY] = useState(0);

    return (
        <FeedContext.Provider value={{
            feedPosts, setFeedPosts,
            feedPage, setFeedPage,
            feedHasMore, setFeedHasMore,
            feedScrollY, setFeedScrollY
        }}>
            {children}
        </FeedContext.Provider>
    );
};

export const useFeedContext = () => useContext(FeedContext);

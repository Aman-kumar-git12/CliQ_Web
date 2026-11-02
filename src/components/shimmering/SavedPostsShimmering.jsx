import PostCardShimmering from "./PostCardShimmering";

// Saved posts: feed post cards. With `withHeader` it is the whole Saved page, otherwise only the cards,
// for the page's own list while it loads (or loads more)
const SavedPostsShimmering = ({ count = 3, withHeader = true, label = "Loading saved posts" }) => {
    const cards = Array.from({ length: count }).map((_, index) => <PostCardShimmering key={index} nested />);

    if (!withHeader) {
        return (
            <div role="status" aria-label={label} aria-busy="true" className="motion-safe:animate-pulse">
                {cards}
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label={label}
            aria-busy="true"
            className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10 motion-safe:animate-pulse"
        >
            <div className="h-2.5 w-24 bg-brand/20 rounded-full mb-2"></div>
            <div className="h-7 md:h-8 w-28 bg-white/10 rounded-lg mb-6"></div>
            {cards}
        </div>
    );
};

export default SavedPostsShimmering;

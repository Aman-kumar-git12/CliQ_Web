import { useEffect, useState, useRef, useCallback } from "react";
import * as postsApi from "../api/posts";
import PostCard from "../components/posts/PostCard";
import HomeSidebar from "../components/home/HomeSidebar";
import useTabFeed from "../hooks/useTabFeed";
import PostInput from "../components/posts/PostInput";
import { useFeedContext } from "../context/FeedContext";
import HomeShimmering from "../components/shimmering/HomeShimmering";

export default function HomePage() {
    const { feedPosts, setFeedPosts, feedPage, setFeedPage, feedHasMore, setFeedHasMore, feedScrollY, setFeedScrollY } =
        useFeedContext();

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const observer = useRef();
    const lastPostElementRef = useCallback(
        (node) => {
            if (loading || loadingMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && feedHasMore) {
                        setFeedPage((prevPage) => prevPage + 1);
                    }
                },
                { rootMargin: "1000px" },
            );
            if (node) observer.current.observe(node);
        },
        [loading, loadingMore, feedHasMore, setFeedPage],
    );

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + "y ago";

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + "mo ago";

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + "d ago";

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + "h ago";

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + "m ago";

        return Math.floor(seconds) + "s ago";
    };

    // Fetch posts feed (Randomized)
    const fetchFeed = async (pageNum) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            // Collect IDs to exclude (only if loading more)
            const excludeIds = pageNum === 1 ? [] : feedPosts.map((p) => p.id);

            const data = await postsApi.getRandomFeed(excludeIds, { silent: true });

            let rawPosts = data.posts || [];
            const apiHasMore = data.hasMore;

            if (rawPosts.length === 0) {
                setFeedHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            setFeedHasMore(apiHasMore);

            // Pre-process posts (backend already provides format, but ensuring consistency)
            const processedPosts = rawPosts.map((post) => ({
                ...post,
                time: timeAgo(post.createdAt),
                // Backend now returns standardized fields, but keeping fallbacks just in case
                username: post.username || "Unknown",
                avatar: post.avatar || "/default-avatar.png",
                likes: post.likes || 0,
                comments: post.comments || 0,
                isLiked: post.isLiked || false,
            }));

            setFeedPosts((prevPosts) => {
                if (pageNum === 1) return processedPosts;
                // Filter duplicates strictly (though backend random logic handles most)
                const newPosts = processedPosts.filter(
                    (newPost) => !prevPosts.some((prevPost) => prevPost.id === newPost.id),
                );
                return [...prevPosts, ...newPosts];
            });
        } catch (err) {
            setError("Failed to load feed");
            console.error("Feed fetch failed:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // First visit: load page 1. Coming back to Home keeps the posts (and page) already in FeedContext,
    // and later pages are fetched by the pagination effect below as the user scrolls.
    useEffect(() => {
        if (feedPosts.length === 0 && feedPage === 1) {
            fetchFeed(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Separate effect for page changes triggered by scroll
    // Save scroll position in real-time (throttled)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setFeedScrollY(window.scrollY);
            }
        };

        // Using a simple throttle to avoid excessive state updates
        let timeoutId = null;
        const throttledScroll = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    handleScroll();
                    timeoutId = null;
                }, 150);
            }
        };

        window.addEventListener("scroll", throttledScroll);
        return () => {
            window.removeEventListener("scroll", throttledScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [setFeedScrollY]);

    // Restore scroll position instantly on mount if we have data
    useEffect(() => {
        if (feedPosts.length > 0 && feedScrollY > 0) {
            // Restore saved scroll position
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: feedScrollY,
                    behavior: "instant",
                });
            });
        }
        // Once on mount: restoring scroll must not fight the user's own scrolling afterwards
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Separate effect for page changes triggered by scroll (pagination)
    useEffect(() => {
        if (feedPage > 1) {
            fetchFeed(feedPage);
        }
        // Only a new page number should trigger a fetch; fetchFeed changes every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feedPage]);

    const [activeTab, setActiveTab] = useState("For You");
    const followingFeed = useTabFeed(postsApi.getFollowingFeed, activeTab === "Following");
    const trendingFeed = useTabFeed(postsApi.getTrendingFeed, activeTab === "Trending");
    const tabFeed = activeTab === "Following" ? followingFeed : activeTab === "Trending" ? trendingFeed : null;

    // Infinite scroll for the Following/Trending tabs (For You has its own observer above)
    const tabObserver = useRef();
    const tabSentinelRef = useCallback(
        (node) => {
            if (tabObserver.current) tabObserver.current.disconnect();
            if (!node || !tabFeed || tabFeed.loading || !tabFeed.hasMore) return;
            tabObserver.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) tabFeed.loadMore();
                },
                { rootMargin: "1000px" },
            );
            tabObserver.current.observe(node);
        },
        [tabFeed],
    );

    if (loading && feedPage === 1 && feedPosts.length === 0) {
        return <HomeShimmering />;
    }

    if (error && feedPosts.length === 0) {
        return <p className="text-center py-10 text-red-500">{error}</p>;
    }

    return (
        <div className="relative flex justify-center gap-10 w-full pt-[85px] md:pt-4 pb-24 md:pb-8 min-h-screen px-4 xl:px-0 bg-transparent">
            {/* FEED COLUMN */}
            <div className="relative flex-grow max-w-[640px] w-full flex flex-col items-center md:items-stretch">
                {/* POST INPUT */}
                <PostInput onPostSuccess={() => fetchFeed(1)} />

                {/* TABS */}
                <div className="flex items-center gap-6 sm:gap-10 mb-6 border-b cliq-feed-divider px-4 max-w-[560px] w-full self-center overflow-x-auto hide-scrollbar">
                    {["For You", "Following", "Trending"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] transition-all relative shrink-0
                ${activeTab === tab ? "text-white" : "text-ink-400 hover:text-[#b2aed0]"}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--cliq-lilac)] rounded-full shadow-[0_0_8px_rgba(167,139,250,0.4)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* FEED LIST */}
                {tabFeed ? (
                    <div className="space-y-4 pb-20">
                        {tabFeed.posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        <div ref={tabSentinelRef} />

                        {tabFeed.loading && (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--cliq-pink)]"></div>
                            </div>
                        )}

                        {tabFeed.isEmpty && (
                            <div className="p-8 text-center cliq-feed-panel rounded-[1.5rem] border-dashed mt-4 max-w-[560px] w-full self-center">
                                <p className="text-neutral-400 text-[13px]">
                                    {activeTab === "Following"
                                        ? "No posts from your connections yet. Find people to connect with on Search or Explore."
                                        : "Nothing is trending yet. Posts with the most likes this month will show up here."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 pb-20">
                        {feedPosts.map((post, index) => {
                            if (feedPosts.length === index + 1) {
                                return (
                                    <div ref={lastPostElementRef} key={post.id}>
                                        <PostCard post={post} />
                                    </div>
                                );
                            } else {
                                return <PostCard key={post.id} post={post} />;
                            }
                        })}

                        {loadingMore && (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--cliq-pink)]"></div>
                            </div>
                        )}

                        {!feedHasMore && feedPosts.length > 0 && (
                            <div className="p-8 text-center cliq-feed-panel rounded-[1.5rem] border-dashed mt-4 max-w-[560px] w-full self-center">
                                <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-[0.25em]">
                                    ✨ End of the universe ✨
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR COLUMN - Scrolls with feed */}
            <div className="relative hidden xl:block w-[320px] shrink-0 pt-2 px-1">
                <HomeSidebar />
            </div>
        </div>
    );
}

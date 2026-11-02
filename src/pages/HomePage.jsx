import { useEffect, useState, useRef, useCallback } from "react";
import * as postsApi from "../api/posts";
import PostCard from "../components/posts/PostCard";
import HomeSidebar from "../components/home/HomeSidebar";
import useTabFeed from "../hooks/useTabFeed";
import PostInput from "../components/posts/PostInput";
import { useFeedContext } from "../context/FeedContext";
import HomeShimmering from "../components/shimmering/HomeShimmering";
import PostCardShimmering from "../components/shimmering/PostCardShimmering";
import { useMediaQuery } from "../hooks/useMediaQuery";

// Following is cursor-paginated; Trending is ranked by likes, so it pages by number.
// Wrapped so useTabFeed's second argument (the cursor) never lands in the axios config slot.
const fetchFollowingPage = (page, cursor) => postsApi.getFollowingFeed(cursor);
const fetchTrendingPage = (page) => postsApi.getTrendingFeed(page);
// The server accepts at most 500 ids to exclude; the most recent ones are the ones a new batch could repeat
const MAX_EXCLUDE_IDS = 500;

export default function HomePage() {
    const { feedPosts, setFeedPosts, feedPage, setFeedPage, feedHasMore, setFeedHasMore, feedScrollYRef } =
        useFeedContext();
    // The right column is only shown on wide screens; don't fetch its data where it's hidden
    const showSidebar = useMediaQuery("(min-width: 1280px)");

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    // One For You request at a time: the observer and "post created" can both ask for a page
    const fetchingRef = useRef(false);

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
        if (fetchingRef.current && pageNum !== 1) return;
        fetchingRef.current = true;
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            // Collect IDs to exclude (only if loading more)
            const excludeIds = pageNum === 1 ? [] : feedPosts.slice(-MAX_EXCLUDE_IDS).map((p) => p.id);

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
            setError(null);

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
            // Stop the infinite scroll: otherwise the observer re-fires right away and repeats the failing request
            if (pageNum !== 1) setFeedHasMore(false);
        } finally {
            fetchingRef.current = false;
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
                feedScrollYRef.current = window.scrollY;
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
    }, [feedScrollYRef]);

    // Restore scroll position instantly on mount if we have data
    useEffect(() => {
        const savedY = feedScrollYRef.current;
        if (feedPosts.length > 0 && savedY > 0) {
            // Restore saved scroll position
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: savedY,
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
    const followingFeed = useTabFeed(fetchFollowingPage, activeTab === "Following");
    const trendingFeed = useTabFeed(fetchTrendingPage, activeTab === "Trending");
    const tabFeed = activeTab === "Following" ? followingFeed : activeTab === "Trending" ? trendingFeed : null;

    // Infinite scroll for the Following/Trending tabs (For You has its own observer above).
    // Depends on the values it reads, not on tabFeed itself (a new object every render), so the
    // observer isn't torn down and re-created on every render.
    const tabObserver = useRef();
    const tabLoading = tabFeed?.loading;
    const tabHasMore = tabFeed?.hasMore;
    const tabLoadMore = tabFeed?.loadMore;
    const tabSentinelRef = useCallback(
        (node) => {
            if (tabObserver.current) tabObserver.current.disconnect();
            if (!node || !tabLoadMore || tabLoading || !tabHasMore) return;
            tabObserver.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) tabLoadMore();
                },
                { rootMargin: "1000px" },
            );
            tabObserver.current.observe(node);
        },
        [tabLoading, tabHasMore, tabLoadMore],
    );

    if (loading && feedPage === 1 && feedPosts.length === 0) {
        return <HomeShimmering />;
    }

    if (error && feedPosts.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-10 pt-[100px] md:pt-10">
                <p className="text-center text-red-500">{error}</p>
                <button
                    type="button"
                    onClick={() => {
                        setError(null);
                        setFeedHasMore(true);
                        fetchFeed(1);
                    }}
                    className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.15em] text-white"
                >
                    Try again
                </button>
            </div>
        );
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

                        {/* Opening the tab: a few post cards; loading more: one below the list */}
                        {tabFeed.loading &&
                            (tabFeed.posts.length ? (
                                <PostCardShimmering label="Loading more posts" />
                            ) : (
                                <div
                                    role="status"
                                    aria-label="Loading posts"
                                    aria-busy="true"
                                    className="space-y-4 motion-safe:animate-pulse"
                                >
                                    {[1, 2, 3].map((i) => (
                                        <PostCardShimmering key={i} nested />
                                    ))}
                                </div>
                            ))}

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

                        {loadingMore && <PostCardShimmering label="Loading more posts" />}

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
            {showSidebar && (
                <div className="relative hidden xl:block w-[320px] shrink-0 pt-2 px-1">
                    <HomeSidebar />
                </div>
            )}
        </div>
    );
}

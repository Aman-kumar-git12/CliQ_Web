import { useEffect, useState, useRef, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import PostCard from "./Postcard";
import { useFeedContext } from "../context/FeedContext";
import HomeShimmering from "./shimmering/HomeShimmering";

export default function Home() {
  const {
    feedPosts, setFeedPosts,
    feedPage, setFeedPage,
    feedHasMore, setFeedHasMore,
    feedScrollY, setFeedScrollY
  } = useFeedContext();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && feedHasMore) {
          setFeedPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, feedHasMore]
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

  // Fetch posts feed
  const fetchFeed = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const limit = 5;
      const res = await axiosClient.get(`/post/feed?page=${pageNum}&limit=${limit}`, {
        withCredentials: true,
      });

      let rawPosts = [];
      let apiHasMore = false;

      if (Array.isArray(res.data)) {
        rawPosts = res.data;
        apiHasMore = rawPosts.length === limit;
      } else if (res.data && Array.isArray(res.data.posts)) {
        rawPosts = res.data.posts;
        apiHasMore = res.data.hasMore !== undefined ? res.data.hasMore : rawPosts.length === limit;
      } else {
        console.warn("Unexpected API response format:", res.data);
      }

      if (rawPosts.length === 0) {
        setFeedHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setFeedHasMore(apiHasMore);

      // Fetch usernames + avatar in parallel
      const postsWithUser = await Promise.all(
        rawPosts.map(async (post) => {
          try {
            const userRes = await axiosClient.get(`/user/${post.userId}`, {
              withCredentials: true,
            });

            const user = userRes.data?.user || {};

            return {
              ...post,
              username: `${user.firstname || "Unknown"} ${user.lastname || ""}`,
              avatar: user.imageUrl || "/default-avatar.png",
              time: timeAgo(post.createdAt),
              likes: post.likes || 0,
              comments: post.comments || 0,
              reposts: post.reposts || 0,
              shares: post.shares || 0,
            };
          } catch (err) {
            console.error("User fetch failed for post:", post.id, err);
            return {
              ...post,
              username: "Unknown",
              avatar: "/default-avatar.png",
            };
          }
        })
      );

      setFeedPosts((prevPosts) => {
        // Filter out duplicates based on ID
        const newPosts = postsWithUser.filter(
          (newPost) => !prevPosts.some((prevPost) => prevPost.id === newPost.id)
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

  useEffect(() => {
    // Only fetch if we have no posts (initial load) or if page changes
    // But if we already have posts and page is 1, don't refetch on mount (navigation back)
    if (feedPosts.length === 0 && feedPage === 1) {
      fetchFeed(1);
    } else if (feedPage > 1) {
      // If page incremented, fetch that page
      // We need to check if we already have data for this page to avoid double fetch?
      // Actually, the page increments via scroll, so we should fetch.
      // But we need to avoid re-fetching the SAME page if we navigated away and came back.
      // Simple check: if feedPosts.length < feedPage * 5 (approx), fetch?
      // Better: Just rely on the fact that setFeedPage is triggered by scroll.
      // If we navigate back, feedPage is already X. We shouldn't fetch X again if we have data.
      // So: Only fetch if we are "loading more" (triggered by scroll) or empty.

      // Wait, if we navigate back, feedPage might be 5.
      // We don't want to fetch page 5 again if we already have the posts.
      // We only want to fetch if the user scrolls MORE.
      // So, we should probably NOT fetch in useEffect[feedPage] if we are just mounting.

      // Let's change logic:
      // 1. On mount, if empty, fetch page 1.
      // 2. If page changes (due to scroll), fetch new page.
      // Problem: How to distinguish "mount with page=5" vs "scroll to page=5"?
      // We can use a ref to track if it's the first render.
    }
  }, []);

  // Separate effect for page changes triggered by scroll
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Restore scroll position immediately
      if (feedScrollY > 0) {
        window.scrollTo(0, feedScrollY);
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }
    if (feedPage > 1) {
      fetchFeed(feedPage);
    }
  }, [feedPage, feedScrollY]); // Added feedScrollY to dependencies

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      setFeedScrollY(window.scrollY);
    };
  }, [setFeedScrollY]);


  if (loading && feedPage === 1 && feedPosts.length === 0) {
    return <HomeShimmering />;
  }

  if (error && feedPosts.length === 0) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  return (
    <div className="w-full pt-4">
      {/* Create Post Input */}
      {/* <div className="flex gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 mb-2">
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
          <img
            src="https://github.com/shadcn.png"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-black dark:text-white">
              Start a thread...
            </span>
          </div>

          <input
            type="text"
            placeholder="What's new?"
            className="w-full bg-transparent text-black dark:text-white placeholder-neutral-500 focus:outline-none text-[15px] mb-3"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Anyone can reply</span>
            <button className="px-4 py-1.5 rounded-3xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity">
              Post
            </button>
          </div>
        </div>
      </div> */}

      {/* FEED POSTS */}
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
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      )}

      {!feedHasMore && feedPosts.length > 0 && (
        <p className="text-center text-neutral-500 py-4 text-sm">
          You've reached the end!
        </p>
      )}
    </div>
  );
}

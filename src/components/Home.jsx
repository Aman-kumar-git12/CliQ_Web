import { useEffect, useState, useRef, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import PostCard from "./Postcard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Fetch posts feed
  const fetchFeed = async (pageNum) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axiosClient.get(`/post/feed?page=${pageNum}&limit=5`, {
        withCredentials: true,
      });

      const { posts: rawPosts = [], hasMore: apiHasMore } = res.data;

      if (!Array.isArray(rawPosts)) {
        console.warn("API posts is not an array:", rawPosts);
      }

      if (rawPosts.length === 0) {
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setHasMore(apiHasMore);

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
              time: new Date(post.createdAt).toLocaleDateString(),
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

      setPosts((prevPosts) => {
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
    fetchFeed(page);
  }, [page]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  return (
    <div className="w-full pt-4">
      {/* Create Post Input */}
      <div className="flex gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 mb-2">
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
      </div>

      {/* FEED POSTS */}
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-400"></div>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-neutral-500 py-4 text-sm">
          You've reached the end!
        </p>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import * as postsApi from "../api/posts";
import PostCard from "../components/posts/PostCard";

export default function SavedPostsPage() {
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (cursor = null) => {
        setLoading(true);
        setError("");
        try {
            const data = await postsApi.getSavedPosts(cursor, { silent: true });
            setPosts((prev) => (cursor ? [...prev, ...data.posts] : data.posts));
            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error("Failed to load saved posts:", err);
            setError("Couldn't load your saved posts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10">
            <div className="flex items-center gap-2 mb-1">
                <Bookmark size={14} className="text-brand" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                    Bookmarks
                </span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase italic leading-none mb-6">
                Saved
            </h1>

            {error && <p className="text-[13px] text-red-400 mb-4">{error}</p>}

            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}

            {!loading && !error && posts.length === 0 && (
                <div className="flex flex-col items-center text-center py-20 rounded-[22px] border border-white/5 bg-surface-800">
                    <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                        <Bookmark size={26} className="text-brand" />
                    </div>
                    <p className="font-black text-[15px]">Nothing saved yet</p>
                    <p className="text-[12px] text-ink-450 mt-1 max-w-xs">
                        Tap the bookmark on any post to keep it here.
                    </p>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-6 text-brand">
                    <Loader2 className="animate-spin" size={22} />
                </div>
            )}

            {nextCursor && !loading && (
                <div className="flex justify-center">
                    <button
                        onClick={() => load(nextCursor)}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.15em]"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}

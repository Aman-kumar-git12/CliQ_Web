import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A paginated post feed for the Home tabs other than For You ("Following", "Trending").
 * Loads page 1 the first time the tab is opened and keeps its posts while the user switches tabs.
 *
 * @param {(page: number) => Promise<{ posts: object[], hasMore: boolean }>} fetchPage service function
 *   that loads one page, e.g. getFollowingFeed from src/api/posts
 * @param {boolean} enabled true while the tab is visible
 */
export default function useTabFeed(fetchPage, enabled) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0); // 0 = nothing loaded yet
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    const loadPage = useCallback(
        async (pageNumber) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            try {
                const data = await fetchPage(pageNumber);
                setPosts((current) => (pageNumber === 1 ? data.posts : [...current, ...data.posts]));
                setHasMore(Boolean(data.hasMore));
                setPage(pageNumber);
            } catch (error) {
                // The API client already showed a toast for real failures; stop paging so we don't loop
                console.error(`Failed to load feed page ${pageNumber}:`, error);
                setHasMore(false);
                setPage((current) => current || 1);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [fetchPage],
    );

    useEffect(() => {
        if (enabled && page === 0) loadPage(1);
    }, [enabled, page, loadPage]);

    const loadMore = useCallback(() => {
        if (hasMore && page > 0) loadPage(page + 1);
    }, [hasMore, page, loadPage]);

    return { posts, loading, hasMore, loadMore, isEmpty: page > 0 && posts.length === 0 };
}

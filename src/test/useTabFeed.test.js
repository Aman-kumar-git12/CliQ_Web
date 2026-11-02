import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useTabFeed from "../hooks/useTabFeed";

const page = (n, hasMore) => ({ posts: [{ id: `p${n}a` }, { id: `p${n}b` }], hasMore });

describe("useTabFeed", () => {
    it("loads nothing until its tab is opened", () => {
        const fetchPage = vi.fn();
        renderHook(() => useTabFeed(fetchPage, false));
        expect(fetchPage).not.toHaveBeenCalled();
    });

    it("loads page 1 when opened and appends later pages", async () => {
        const fetchPage = vi.fn((n) => Promise.resolve(page(n, n < 2)));
        const { result } = renderHook(() => useTabFeed(fetchPage, true));

        await waitFor(() => expect(result.current.posts).toHaveLength(2));
        expect(fetchPage).toHaveBeenCalledWith(1, null);

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.posts).toHaveLength(4));
        expect(fetchPage).toHaveBeenLastCalledWith(2, null);
        expect(result.current.hasMore).toBe(false);
    });

    it("passes the previous page's nextCursor to cursor-paginated feeds", async () => {
        const fetchPage = vi.fn((n) => Promise.resolve({ ...page(n, n < 2), nextCursor: n < 2 ? `after-${n}` : null }));
        const { result } = renderHook(() => useTabFeed(fetchPage, true));
        await waitFor(() => expect(result.current.posts).toHaveLength(2));

        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.posts).toHaveLength(4));
        expect(fetchPage).toHaveBeenLastCalledWith(2, "after-1");
    });

    it("reports an empty feed so the tab can explain why", async () => {
        const { result } = renderHook(() => useTabFeed(() => Promise.resolve({ posts: [], hasMore: false }), true));
        await waitFor(() => expect(result.current.isEmpty).toBe(true));
    });

    it("stops paging after a failure instead of retrying forever", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const fetchPage = vi.fn(() => Promise.reject(new Error("offline")));
        const { result } = renderHook(() => useTabFeed(fetchPage, true));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.hasMore).toBe(false);
        act(() => result.current.loadMore());
        expect(fetchPage).toHaveBeenCalledTimes(1);
    });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api/posts", () => ({ getSavedPosts: vi.fn() }));
vi.mock("../components/posts/PostCard", () => ({ default: ({ post }) => <article>{post.content}</article> }));

import * as postsApi from "../api/posts";
import SavedPostsPage from "./SavedPostsPage";

describe("SavedPostsPage loading", () => {
    it("shows post card skeletons while the saved posts load", () => {
        vi.mocked(postsApi.getSavedPosts).mockReturnValue(new Promise(() => {}));
        const { container } = render(<SavedPostsPage />);
        expect(screen.getByRole("status", { name: "Loading saved posts" })).toBeInTheDocument();
        expect(screen.queryByText("Nothing saved yet")).not.toBeInTheDocument();
        expect(container.querySelector(".animate-spin")).toBeNull();
    });

    it("replaces the skeletons with the posts", async () => {
        vi.mocked(postsApi.getSavedPosts).mockResolvedValue({
            posts: [{ id: "p1", content: "Saved thought" }],
            nextCursor: null,
        });
        render(<SavedPostsPage />);
        expect(await screen.findByText("Saved thought")).toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});

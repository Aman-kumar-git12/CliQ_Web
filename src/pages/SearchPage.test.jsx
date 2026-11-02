import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/search", () => ({ searchAll: vi.fn() }));
vi.mock("../api/users", () => ({ getSuggestedUsers: vi.fn() }));
vi.mock("../api/connections", () => ({ getConnectionStatus: vi.fn() }));
vi.mock("../context/UserContext", () => ({ useUserContext: () => ({ user: { id: "me" } }) }));

import * as searchApi from "../api/search";
import * as usersApi from "../api/users";
import { clearRequestCache } from "../utils/requestCache";
import SearchPage from "./SearchPage";

const renderAt = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <SearchPage />
        </MemoryRouter>,
    );

describe("SearchPage loading", () => {
    beforeEach(() => {
        clearRequestCache();
        vi.mocked(usersApi.getSuggestedUsers).mockResolvedValue([]);
    });
    afterEach(() => vi.useRealTimers());

    it("shows skeleton rows for the results while a search loads, not a spinner", () => {
        vi.mocked(searchApi.searchAll).mockReturnValue(new Promise(() => {}));
        const { container } = renderAt("/search?q=react");
        expect(screen.getByRole("status", { name: "Loading search results" })).toBeInTheDocument();
        expect(screen.queryByText(/No results for/)).not.toBeInTheDocument();
        expect(container.querySelector(".animate-spin")).toBeNull();
    });

    it("shows the skeleton as soon as a new query is typed, before the debounced request", () => {
        vi.useFakeTimers();
        vi.mocked(searchApi.searchAll).mockResolvedValue({ people: [], posts: [], hashtags: [] });
        renderAt("/search");
        expect(screen.queryByRole("status", { name: "Loading search results" })).not.toBeInTheDocument();

        fireEvent.change(screen.getByRole("searchbox", { name: "Search posts, people and hashtags" }), {
            target: { value: "ml" },
        });
        expect(screen.getByRole("status", { name: "Loading search results" })).toBeInTheDocument();
        expect(searchApi.searchAll).not.toHaveBeenCalled();
    });

    it("shows the results once they arrive", async () => {
        vi.mocked(searchApi.searchAll).mockResolvedValue({
            people: [],
            posts: [],
            hashtags: [{ tag: "react", postsCount: 3 }],
        });
        renderAt("/search?q=react");
        expect(await screen.findByText("#react")).toBeInTheDocument();
        await act(async () => {});
        expect(screen.queryByRole("status", { name: "Loading search results" })).not.toBeInTheDocument();
    });
});

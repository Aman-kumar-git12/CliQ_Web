import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../context/UserContext", () => ({ useUserContext: vi.fn() }));

import { useUserContext } from "../context/UserContext";
import ProtectedRoute from "./ProtectedRoute";

const renderAt = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="*" element={<p>Page content</p>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

describe("ProtectedRoute", () => {
    it("shows the requested page's skeleton inside the app frame while the session is checked", () => {
        vi.mocked(useUserContext).mockReturnValue({ user: null, loading: true, blockedAccount: false });
        const { container } = renderAt("/saved");
        expect(screen.getByRole("status", { name: "Loading saved posts" })).toBeInTheDocument();
        expect(container.querySelector(".animate-spin")).toBeNull();
        expect(screen.queryByText("Page content")).not.toBeInTheDocument();
    });

    it("shows the conversation list and thread skeletons for an open chat", () => {
        vi.mocked(useUserContext).mockReturnValue({ user: null, loading: true, blockedAccount: false });
        renderAt("/messages/u1");
        expect(screen.getByRole("status", { name: "Loading conversations" })).toBeInTheDocument();
        expect(screen.getByRole("status", { name: "Loading conversation" })).toBeInTheDocument();
    });

    it("renders the page once the user is known", () => {
        vi.mocked(useUserContext).mockReturnValue({ user: { id: "me" }, loading: false, blockedAccount: false });
        renderAt("/saved");
        expect(screen.getByText("Page content")).toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});

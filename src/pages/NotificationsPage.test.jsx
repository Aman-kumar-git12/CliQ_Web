import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../context/NotificationContext", () => ({ useNotifications: vi.fn() }));

import { useNotifications } from "../context/NotificationContext";
import NotificationsPage from "./NotificationsPage";

const context = (overrides) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    removeNotification: vi.fn(),
    ...overrides,
});

const renderPage = () =>
    render(
        <MemoryRouter>
            <NotificationsPage />
        </MemoryRouter>,
    );

const notification = {
    id: "n1",
    type: "like",
    isRead: false,
    actorId: "a1",
    actor: { firstname: "Ada", lastname: "Lovelace" },
    createdAt: new Date().toISOString(),
};

describe("NotificationsPage loading", () => {
    it("shows skeleton rows (not a spinner or the empty state) while the first page loads", () => {
        vi.mocked(useNotifications).mockReturnValue(context({ loading: true }));
        const { container } = renderPage();
        expect(screen.getByRole("status", { name: "Loading notifications" })).toBeInTheDocument();
        expect(screen.queryByText("No notifications yet")).not.toBeInTheDocument();
        expect(container.querySelector(".animate-spin")).toBeNull();
    });

    it("shows skeleton rows below the list while more load", () => {
        vi.mocked(useNotifications).mockReturnValue(context({ loading: true, notifications: [notification] }));
        renderPage();
        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
        expect(screen.getByRole("status", { name: "Loading more notifications" })).toBeInTheDocument();
    });

    it("shows no skeleton once loaded", () => {
        vi.mocked(useNotifications).mockReturnValue(context({ notifications: [notification] }));
        renderPage();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});

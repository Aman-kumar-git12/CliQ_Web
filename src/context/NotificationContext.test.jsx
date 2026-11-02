import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const socket = (() => {
    const listeners = new Map();
    return {
        on: (event, fn) => listeners.set(event, fn),
        off: (event) => listeners.delete(event),
        io: { on: () => {}, off: () => {} },
        serverSends: (event, data) => listeners.get(event)?.(data),
    };
})();

vi.mock("./UserContext", () => ({ useUserContext: () => ({ user: { id: "me" } }) }));
vi.mock("./SocketContext", () => ({ useSocket: () => socket }));
vi.mock("../api/notifications", () => ({
    getNotifications: vi.fn(() => Promise.resolve({ notifications: [], unreadCount: 0, nextCursor: null })),
}));
vi.mock("../api/connections", () => ({ getConnectionRequests: vi.fn() }));

import * as connectionsApi from "../api/connections";
import { NotificationProvider, useNotifications } from "./NotificationContext";

const Badge = ({ label }) => {
    const { pendingRequestsCount } = useNotifications();
    return (
        <span>
            {label}: {pendingRequestsCount}
        </span>
    );
};

describe("NotificationContext pending connection requests", () => {
    it("loads the count once for every badge, and again when a connection request arrives", async () => {
        connectionsApi.getConnectionRequests
            .mockResolvedValueOnce({ connectionRequests: [{ id: "r1" }] })
            .mockResolvedValueOnce({ connectionRequests: [{ id: "r1" }, { id: "r2" }] });

        render(
            <NotificationProvider>
                <Badge label="sidebar" />
                <Badge label="mobile" />
            </NotificationProvider>,
        );

        await waitFor(() => expect(screen.getByText("sidebar: 1")).toBeInTheDocument());
        expect(screen.getByText("mobile: 1")).toBeInTheDocument();
        expect(connectionsApi.getConnectionRequests).toHaveBeenCalledTimes(1);

        act(() =>
            socket.serverSends("notification:new", {
                notification: { id: "n1", type: "connection_request" },
                unreadCount: 1,
            }),
        );
        await waitFor(() => expect(screen.getByText("sidebar: 2")).toBeInTheDocument());
        expect(connectionsApi.getConnectionRequests).toHaveBeenCalledTimes(2);
    });
});

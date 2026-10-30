import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../api/axiosClient";
import createSocketConnection from "../components/Chat/socket";
import { useUserContext } from "./userContext";

const NotificationContext = createContext(null);
const PAGE_SIZE = 20;

export const NotificationProvider = ({ children }) => {
    const { user } = useUserContext();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    const fetchPage = useCallback(async (cursor = null) => {
        const res = await axiosClient.get("/notifications", {
            params: { limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) },
        });
        setUnreadCount(res.data.unreadCount ?? 0);
        setNextCursor(res.data.nextCursor ?? null);
        return res.data.notifications ?? [];
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setNotifications(await fetchPage());
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchPage]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || loading) return;
        setLoading(true);
        try {
            const page = await fetchPage(nextCursor);
            setNotifications((prev) => {
                const seen = new Set(prev.map((n) => n.id));
                return [...prev, ...page.filter((n) => !seen.has(n.id))];
            });
        } catch (err) {
            console.error("Failed to load more notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchPage, nextCursor, loading]);

    // Initial load + live socket while logged in.
    useEffect(() => {
        if (!user?.id) {
            setNotifications([]);
            setUnreadCount(0);
            setNextCursor(null);
            return;
        }

        refresh();

        const socket = createSocketConnection();
        socketRef.current = socket;

        socket.on("notification:new", ({ notification, unreadCount: count }) => {
            // Re-liking a post refreshes an existing notification, so move it to the top.
            setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
            if (typeof count === "number") setUnreadCount(count);
        });
        socket.on("notification:count", ({ unreadCount: count }) => {
            if (typeof count === "number") setUnreadCount(count);
        });
        // Notifications missed while disconnected are picked up on reconnect.
        socket.io.on("reconnect", refresh);

        return () => {
            socket.io.off("reconnect", refresh);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?.id, refresh]);

    const markRead = useCallback(async (notificationId) => {
        const target = notifications.find((n) => n.id === notificationId);
        if (!target || target.isRead) return;

        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
        setUnreadCount((count) => Math.max(0, count - 1));
        try {
            const res = await axiosClient.patch(`/notifications/${notificationId}/read`);
            setUnreadCount(res.data.unreadCount ?? 0);
        } catch (err) {
            console.error("Failed to mark notification read:", err);
            refresh();
        }
    }, [notifications, refresh]);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await axiosClient.patch("/notifications/read-all");
        } catch (err) {
            console.error("Failed to mark all notifications read:", err);
            refresh();
        }
    }, [refresh]);

    const removeNotification = useCallback(async (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        try {
            const res = await axiosClient.delete(`/notifications/${notificationId}`);
            setUnreadCount(res.data.unreadCount ?? 0);
        } catch (err) {
            console.error("Failed to delete notification:", err);
            refresh();
        }
    }, [refresh]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            hasMore: Boolean(nextCursor),
            refresh,
            loadMore,
            markRead,
            markAllRead,
            removeNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

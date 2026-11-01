import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as notificationsApi from "../api/notifications";
import { useSocket } from "./SocketContext";
import { useUserContext } from "./UserContext";

const NotificationContext = createContext(null);
const PAGE_SIZE = 20;

export const NotificationProvider = ({ children }) => {
    const { user } = useUserContext();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const socket = useSocket();
    // Bumped by every refresh and on user change: a response from an older generation (a slower
    // refresh, or the previous account after a logout) is ignored instead of overwriting newer data.
    const generationRef = useRef(0);

    const fetchPage = useCallback(async (cursor = null) => {
        const data = await notificationsApi.getNotifications({ limit: PAGE_SIZE, ...(cursor ? { cursor } : {}) });
        return data;
    }, []);

    const applyPageMeta = (data) => {
        setUnreadCount(data.unreadCount ?? 0);
        setNextCursor(data.nextCursor ?? null);
    };

    const refresh = useCallback(async () => {
        const generation = ++generationRef.current;
        setLoading(true);
        try {
            const data = await fetchPage();
            if (generation !== generationRef.current) return;
            applyPageMeta(data);
            setNotifications(data.notifications ?? []);
        } catch (err) {
            if (generation !== generationRef.current) return;
            console.error("Failed to load notifications:", err);
        } finally {
            if (generation === generationRef.current) setLoading(false);
        }
    }, [fetchPage]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || loading) return;
        const generation = generationRef.current;
        setLoading(true);
        try {
            const data = await fetchPage(nextCursor);
            if (generation !== generationRef.current) return; // the list was reloaded meanwhile
            applyPageMeta(data);
            const page = data.notifications ?? [];
            setNotifications((prev) => {
                const seen = new Set(prev.map((n) => n.id));
                return [...prev, ...page.filter((n) => !seen.has(n.id))];
            });
        } catch (err) {
            if (generation !== generationRef.current) return;
            console.error("Failed to load more notifications:", err);
        } finally {
            if (generation === generationRef.current) setLoading(false);
        }
    }, [fetchPage, nextCursor, loading]);

    // Initial load + live socket while logged in.
    useEffect(() => {
        if (!user?.id) {
            generationRef.current += 1; // drop any in-flight response for the previous account
            setNotifications([]);
            setUnreadCount(0);
            setNextCursor(null);
            setLoading(false);
            return;
        }
        refresh();
    }, [user?.id, refresh]);

    // Live updates over the shared socket
    useEffect(() => {
        if (!socket) return;
        const onNew = ({ notification, unreadCount: count }) => {
            // Re-liking a post refreshes an existing notification, so move it to the top.
            setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
            if (typeof count === "number") setUnreadCount(count);
        };
        const onCount = ({ unreadCount: count }) => {
            if (typeof count === "number") setUnreadCount(count);
        };
        socket.on("notification:new", onNew);
        socket.on("notification:count", onCount);
        // Notifications missed while disconnected are picked up on reconnect.
        socket.io.on("reconnect", refresh);
        return () => {
            socket.off("notification:new", onNew);
            socket.off("notification:count", onCount);
            socket.io.off("reconnect", refresh);
        };
    }, [socket, refresh]);

    const markRead = useCallback(
        async (notificationId) => {
            const target = notifications.find((n) => n.id === notificationId);
            if (!target || target.isRead) return;

            setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
            setUnreadCount((count) => Math.max(0, count - 1));
            try {
                const data = await notificationsApi.markNotificationRead(notificationId);
                setUnreadCount(data.unreadCount ?? 0);
            } catch (err) {
                console.error("Failed to mark notification read:", err);
                refresh();
            }
        },
        [notifications, refresh],
    );

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await notificationsApi.markAllNotificationsRead();
        } catch (err) {
            console.error("Failed to mark all notifications read:", err);
            refresh();
        }
    }, [refresh]);

    const removeNotification = useCallback(
        async (notificationId) => {
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            try {
                const data = await notificationsApi.deleteNotification(notificationId);
                setUnreadCount(data.unreadCount ?? 0);
            } catch (err) {
                console.error("Failed to delete notification:", err);
                refresh();
            }
        },
        [refresh],
    );

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                hasMore: Boolean(nextCursor),
                refresh,
                loadMore,
                markRead,
                markAllRead,
                removeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

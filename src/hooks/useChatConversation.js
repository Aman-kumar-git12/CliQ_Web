/** Chat page data loading: the other user, whether messaging is allowed, and the message history. */
import { useCallback, useEffect, useRef, useState } from "react";
import * as chatApi from "../api/chat";
import * as connectionsApi from "../api/connections";
import * as usersApi from "../api/users";

/**
 * Turns a history row from GET /chat/history into the shape the message list renders.
 * The other user's name and photo are filled in from `targetUser` (null until it has loaded).
 */
export const mapHistoryMessage = (msg, user, targetUser) => {
    const isMe = msg.senderId === user.id;
    return {
        id: msg.id,
        text: msg.isDelete ? "This message is deleted" : msg.text,
        image: msg.image,
        file: msg.file,
        originalName: msg.originalName,
        firstname: isMe ? user.firstname : targetUser?.firstname || "User",
        isMe,
        date: msg.createdAt,
        isDelete: msg.isDelete,
        imageUrl: isMe ? user.imageUrl : targetUser?.imageUrl,
        parentMessage: msg.parentMessage,
    };
};

export const useChatConversation = ({
    targetuserId,
    user,
    setMessages,
    setIsSelectMode,
    setSelectedMessages,
    setReplyTo,
    setNewMessage,
}) => {
    const [targetUser, setTargetUser] = useState(null);
    // null while checking; false hides the input because only connections can message each other
    const [canMessage, setCanMessage] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [targetUserLoading, setTargetUserLoading] = useState(true);
    // Bumped by reloadHistory (e.g. after the socket reconnects) to fetch the history again in the background
    const [historyVersion, setHistoryVersion] = useState(0);
    const loadedHistoryForRef = useRef(null);
    const targetUserRef = useRef(null);
    targetUserRef.current = targetUser?.id === targetuserId ? targetUser : null;

    // Fetch Target User
    useEffect(() => {
        // Reset selection state when switching users
        setIsSelectMode(false);
        setSelectedMessages(new Set());
        setReplyTo(null);
        setNewMessage("");
        // The previous chat's name and photo must not show in the header while the new one loads
        setTargetUser(null);
        setTargetUserLoading(true);

        // Responses for a previously opened chat are dropped when the user switches conversations
        const controller = new AbortController();
        const { signal } = controller;

        const fetchTargetUser = async () => {
            if (!targetuserId) return;
            try {
                const data = await usersApi.getUser(targetuserId, { signal });
                setTargetUser(data.user);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching target user:", error);
            }
            setTargetUserLoading(false);
        };
        fetchTargetUser();

        const fetchConnectionStatus = async () => {
            if (!targetuserId) return;
            setCanMessage(null);
            try {
                const data = await connectionsApi.getConnectionStatus(targetuserId, { signal });
                setCanMessage(data?.status === "accepted");
            } catch (error) {
                if (signal.aborted) return;
                // The server still enforces the rule, so let the user try rather than block on a failed check
                console.error("Error checking connection status:", error);
                setCanMessage(true);
            }
        };
        fetchConnectionStatus();
        return () => controller.abort();
        // The reset setters come from useState in ChatPage and never change identity; only a new chat re-runs this
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetuserId]);

    // Fetch Chat History: in parallel with the user above (it used to wait for it, then load a second time)
    useEffect(() => {
        const controller = new AbortController(); // a late history for a previous chat (or older load) is dropped
        const { signal } = controller;
        if (!targetuserId || !user?.id) return undefined;

        // A first load (new chat) shows the loader and clears the previous chat's messages;
        // a background reload keeps the list on screen
        const isReload = loadedHistoryForRef.current === targetuserId;
        if (!isReload) {
            setHistoryLoading(true);
            setMessages([]);
        }

        const fetchHistory = async () => {
            try {
                const history = await chatApi.getChatHistory(targetuserId, { signal });
                const mapped = history.map((msg) => mapHistoryMessage(msg, user, targetUserRef.current));
                if (isReload) {
                    // Keep messages still waiting for the server's ack (temporary ids) after a background reload
                    setMessages((prev) => {
                        const known = new Set(mapped.map((m) => m.id));
                        return [
                            ...mapped,
                            ...prev.filter((m) => m.isMe && !known.has(m.id) && !/^[0-9a-f]{24}$/.test(String(m.id))),
                        ];
                    });
                } else {
                    setMessages(mapped);
                }
                loadedHistoryForRef.current = targetuserId;
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching history:", error);
            }
            setHistoryLoading(false);
        };
        fetchHistory();
        return () => controller.abort();
        // setMessages is ChatPage's useState setter (stable identity), so it is not listed; the user's own
        // name/photo are read when the history arrives
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetuserId, user?.id, historyVersion]);

    // The other user's name and photo arrive separately: fill them into their messages once known
    useEffect(() => {
        if (!targetUser || targetUser.id !== targetuserId) return;
        setMessages((prev) =>
            prev.map((m) =>
                m.isMe ? m : { ...m, firstname: targetUser.firstname || m.firstname, imageUrl: targetUser.imageUrl },
            ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUser]);

    const reloadHistory = useCallback(() => setHistoryVersion((v) => v + 1), []);

    return {
        targetUser,
        canMessage,
        setCanMessage,
        loading: historyLoading || targetUserLoading,
        reloadHistory,
    };
};

export default useChatConversation;

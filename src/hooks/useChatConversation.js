/** Chat page data loading: the other user, whether messaging is allowed, and the message history. */
import { useEffect, useState } from "react";
import * as chatApi from "../api/chat";
import * as connectionsApi from "../api/connections";
import * as usersApi from "../api/users";

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
    const [loading, setLoading] = useState(true);

    // Fetch Target User
    useEffect(() => {
        // Reset selection state when switching users
        setIsSelectMode(false);
        setSelectedMessages(new Set());
        setReplyTo(null);
        setNewMessage("");

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

    // Fetch Chat History
    useEffect(() => {
        const controller = new AbortController(); // a late history for a previous chat (or older load) is dropped
        const { signal } = controller;

        const fetchHistory = async () => {
            if (!targetuserId || !user?.id) return;

            setLoading(true);

            try {
                const history = await chatApi.getChatHistory(targetuserId, { signal });

                const mappedMessages = history.map((msg) => ({
                    id: msg.id,
                    text: msg.isDelete ? "This message is deleted" : msg.text,
                    image: msg.image,
                    file: msg.file,
                    firstname: msg.senderId === user.id ? user.firstname : targetUser?.firstname || "User",
                    isMe: msg.senderId === user.id,
                    date: msg.createdAt,
                    isDelete: msg.isDelete,
                    imageUrl: msg.senderId === user.id ? user.imageUrl : targetUser?.imageUrl,
                    parentMessage: msg.parentMessage,
                }));
                setMessages(mappedMessages);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching history:", error);
            }
            setLoading(false);
        };
        fetchHistory();
        return () => controller.abort();
        // setMessages is ChatPage's useState setter (stable identity), so it is not listed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetuserId, user?.id, user?.firstname, user?.imageUrl, targetUser]);

    return { targetUser, canMessage, setCanMessage, loading };
};

export default useChatConversation;

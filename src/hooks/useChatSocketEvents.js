/** Chat page live events over the shared socket: incoming/deleted/edited messages and the other user's online status. */
import { useEffect, useRef, useState } from "react";

/**
 * Appends an incoming socket message unless a message with the same id is already listed
 * (the same event delivered twice, e.g. around a reconnect, must not show the message twice).
 */
export const appendIncomingMessage = (prev, message) =>
    message.id && prev.some((m) => m.id === message.id) ? prev : [...prev, message];

export const useChatSocketEvents = ({
    socket,
    user,
    targetuserId,
    targetUser,
    setMessages,
    scrollToBottom,
    onReconnect,
}) => {
    // Online Status State
    const [isTargetOnline, setIsTargetOnline] = useState(false);

    // Read through refs so the listeners always see the latest values without leaving and re-joining
    // the chat room every time the other user's profile arrives or the parent re-renders
    const targetUserRef = useRef(targetUser);
    targetUserRef.current = targetUser;
    const scrollToBottomRef = useRef(scrollToBottom);
    scrollToBottomRef.current = scrollToBottom;
    const onReconnectRef = useRef(onReconnect);
    onReconnectRef.current = onReconnect;

    const userId = user?.id;
    const userFirstname = user?.firstname;

    // Live chat events over the shared socket (see context/SocketContext)
    useEffect(() => {
        if (!socket || !userId || !targetuserId) return;
        setIsTargetOnline(false);

        const joinChat = () => {
            socket.emit("joinChat", { firstname: userFirstname, userId, targetuserId });
            socket.emit("userConnected", { userId });
            socket.emit("checkStatus", { userId: targetuserId }, (response) => {
                setIsTargetOnline(response?.status === "online");
            });
        };
        joinChat();

        // A reconnect is a new connection on the server: it is in no chat room any more, so join again,
        // and fetch the history to pick up messages sent while the connection was down
        let wasConnected = socket.connected;
        const handleConnect = () => {
            if (wasConnected) {
                joinChat();
                onReconnectRef.current?.();
            }
            wasConnected = true;
        };

        let scrollTimer = null;
        const handleIncomingMessage = (data) => {
            // The shared socket can still be in other chats' rooms: only this conversation's messages belong here
            if (String(data.senderId) !== String(targetuserId)) return;
            setMessages((prev) =>
                appendIncomingMessage(prev, {
                    id: data.id || Date.now() + Math.random(),
                    firstname: data.firstname,
                    text: data.text,
                    image: data.image,
                    file: data.file,
                    originalName: data.originalName,
                    isMe: false,
                    date: data.createdAt || new Date(),
                    isDelete: data.isDelete || false,
                    imageUrl: targetUserRef.current?.imageUrl,
                    parentMessage: data.parentMessage,
                }),
            );

            // Notify Inbox to move this user to top
            window.dispatchEvent(
                new CustomEvent("chatUpdated", {
                    detail: { targetId: data.senderId, lastMessage: data.text || (data.image ? "Image" : "File") },
                }),
            );

            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => scrollToBottomRef.current?.("smooth"), 100);
        };
        const handleDeleted = ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, isDelete: true, text: "This message is deleted" } : msg,
                ),
            );
        };
        const handleUpdated = ({ messageId, text }) => {
            setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, text: text } : msg)));
        };
        const handleStatus = (data) => {
            if (String(data.userId) === String(targetuserId)) {
                setIsTargetOnline(data.status === "online");
            }
        };

        socket.on("connect", handleConnect);
        socket.on("receiveMessage", handleIncomingMessage);
        socket.on("messageDeleted", handleDeleted);
        socket.on("messageUpdated", handleUpdated);
        socket.on("statusUpdate", handleStatus);

        return () => {
            clearTimeout(scrollTimer);
            socket.off("connect", handleConnect);
            socket.off("receiveMessage", handleIncomingMessage);
            socket.off("messageDeleted", handleDeleted);
            socket.off("messageUpdated", handleUpdated);
            socket.off("statusUpdate", handleStatus);
            socket.emit("leaveChat", { targetuserId });
        };
        // setMessages is a stable useState setter; everything else that changes is read through refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userId, targetuserId]);

    return { isTargetOnline };
};

export default useChatSocketEvents;

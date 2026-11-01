/** Chat page live events over the shared socket: incoming/deleted/edited messages and the other user's online status. */
import { useEffect, useState } from "react";

export const useChatSocketEvents = ({ socket, user, targetuserId, targetUser, setMessages, scrollToBottom }) => {
    // Online Status State
    const [isTargetOnline, setIsTargetOnline] = useState(false);

    // Live chat events over the shared socket (see context/SocketContext)
    useEffect(() => {
        if (!socket || !user || !targetuserId) return;

        socket.emit("joinChat", { firstname: user.firstname, userId: user.id, targetuserId });
        socket.emit("userConnected", { userId: user.id });
        socket.emit("checkStatus", { userId: targetuserId }, (response) => {
            setIsTargetOnline(response.status === "online");
        });

        const handleIncomingMessage = (data) => {
            // The shared socket can still be in other chats' rooms: only this conversation's messages belong here
            if (String(data.senderId) !== String(targetuserId)) return;
            setMessages((prev) => [
                ...prev,
                {
                    id: data.id || Date.now() + Math.random(),
                    firstname: data.firstname,
                    text: data.text,
                    image: data.image,
                    file: data.file,
                    isMe: false,
                    date: data.createdAt || new Date(),
                    isDelete: data.isDelete || false,
                    imageUrl: targetUser?.imageUrl,
                    parentMessage: data.parentMessage,
                },
            ]);

            // Notify Inbox to move this user to top
            window.dispatchEvent(
                new CustomEvent("chatUpdated", {
                    detail: { targetId: data.senderId, lastMessage: data.text || (data.image ? "Image" : "File") },
                }),
            );

            setTimeout(() => scrollToBottom("smooth"), 100);
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

        socket.on("receiveMessage", handleIncomingMessage);
        socket.on("messageDeleted", handleDeleted);
        socket.on("messageUpdated", handleUpdated);
        socket.on("statusUpdate", handleStatus);

        return () => {
            socket.off("receiveMessage", handleIncomingMessage);
            socket.off("messageDeleted", handleDeleted);
            socket.off("messageUpdated", handleUpdated);
            socket.off("statusUpdate", handleStatus);
            socket.emit("leaveChat", { targetuserId });
        };
        // setMessages is a stable useState setter and scrollToBottom only reads refs, so neither re-subscribes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, user, targetuserId, targetUser]);

    return { isTargetOnline };
};

export default useChatSocketEvents;

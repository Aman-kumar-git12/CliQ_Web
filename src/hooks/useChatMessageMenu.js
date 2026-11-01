/** Chat page per-message actions: the open options menu, editing a message and the single-message delete dialog. */
import { useState } from "react";
import * as chatApi from "../api/chat";

export const useChatMessageMenu = ({ setMessages, targetuserId, setNewMessage, inputRef }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, messageId: null, isMe: false });
    const [menuDirection, setMenuDirection] = useState("down");

    const closeDeleteConfirmation = () => setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false });

    const confirmDelete = async (type) => {
        const id = deleteConfirmation.messageId;
        if (!id) return;
        try {
            setDeleteConfirmation({ isOpen: false, messageId: null, isMe: false });
            if (type === "everyone") {
                setMessages((prev) => {
                    const updated = prev.map((msg) =>
                        msg.id === id ? { ...msg, isDelete: true, text: "This message is deleted" } : msg,
                    );
                    // Notify Inbox of new last message
                    const lastVisible = updated.filter((m) => !m.isDelete).at(-1);
                    window.dispatchEvent(
                        new CustomEvent("chatUpdated", {
                            detail: {
                                targetId: targetuserId,
                                lastMessage: lastVisible ? lastVisible.text : "No messages yet",
                            },
                        }),
                    );
                    return updated;
                });
                await chatApi.updateChatMessage(id, { isDelete: true });
            } else {
                setMessages((prev) => {
                    const filtered = prev.filter((msg) => msg.id !== id);
                    // Notify Inbox of new last message
                    const lastVisible = filtered.filter((m) => !m.isDelete).at(-1);
                    window.dispatchEvent(
                        new CustomEvent("chatUpdated", {
                            detail: {
                                targetId: targetuserId,
                                lastMessage: lastVisible ? lastVisible.text : "No messages yet",
                            },
                        }),
                    );
                    return filtered;
                });
                await chatApi.deleteChatMessage(id);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const toggleMenu = (id, e) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }
        if (e) {
            const threshold = window.innerHeight * 0.6;
            setMenuDirection(e.clientY > threshold ? "up" : "down");
        } else {
            setMenuDirection("down");
        }
        setOpenMenuId(id);
    };

    const handleEditStart = (id, text) => {
        setUpdateMessage(id);
        setNewMessage(text);
        setOpenMenuId(null);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(text.length, text.length);
            }
        }, 10);
    };

    const handleDeleteStart = (id, isMe, isDeleted = false) => {
        // If message is already deleted for everyone, only show "Delete for me"
        const showDeleteForEveryone = isMe && !isDeleted;
        setDeleteConfirmation({ isOpen: true, messageId: id, isMe: showDeleteForEveryone });
        setOpenMenuId(null);
    };

    return {
        openMenuId,
        setOpenMenuId,
        menuDirection,
        toggleMenu,
        updateMessage,
        setUpdateMessage,
        handleEditStart,
        deleteConfirmation,
        handleDeleteStart,
        closeDeleteConfirmation,
        confirmDelete,
    };
};

export default useChatMessageMenu;

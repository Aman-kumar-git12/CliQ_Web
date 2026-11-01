/** Chat page multi-select mode: selected message ids and the bulk delete flow. */
import { useMemo, useState } from "react";
import * as chatApi from "../api/chat";

export const useChatSelection = ({ messages, setMessages, setToast, targetuserId }) => {
    // Multi-Select State
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    const canDeleteForEveryone = useMemo(() => {
        const selectedIds = Array.from(selectedMessages);
        if (selectedIds.length === 0) return false;
        return selectedIds.every((id) => {
            const msg = messages.find((m) => m.id === id);
            return msg?.isMe === true && !msg?.isDelete; // All must be 'me' AND not already deleted
        });
    }, [selectedMessages, messages]);

    const handleBulkDelete = async (type = "me") => {
        if (selectedMessages.size === 0) return;

        if (!bulkDeleteConfirmOpen) {
            setBulkDeleteConfirmOpen(true);
            return;
        }

        try {
            setIsBulkDeleting(true);
            setBulkDeleteConfirmOpen(false);
            const result = await chatApi.deleteChatMessages(Array.from(selectedMessages), type, { silent: true });

            if (result.success) {
                // Update local state based on delete type
                if (type === "everyone") {
                    // Soft delete: Keep in list but mark as deleted
                    setMessages((prev) =>
                        prev.map((msg) =>
                            selectedMessages.has(msg.id)
                                ? {
                                      ...msg,
                                      isDelete: true,
                                      text: "This message is deleted",
                                      image: null,
                                      file: null,
                                      originalName: null,
                                  }
                                : msg,
                        ),
                    );
                } else {
                    // Hard delete (for me): Remove from UI entirely
                    setMessages((prev) => prev.filter((msg) => !selectedMessages.has(msg.id)));
                }

                setToast(`Deleted ${selectedMessages.size} messages`);
                exitSelectMode();

                // Notify Inbox of new last message
                const lastVisible = messages.filter((m) => !selectedMessages.has(m.id) && !m.isDelete).at(-1);
                window.dispatchEvent(
                    new CustomEvent("chatUpdated", {
                        detail: {
                            targetId: targetuserId,
                            lastMessage: lastVisible ? lastVisible.text : "No messages yet",
                        },
                    }),
                );
            }
        } catch (error) {
            console.error("Bulk delete failed:", error);
            setToast("Failed to delete messages");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleMessageSelection = (id) => {
        setSelectedMessages((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const exitSelectMode = () => {
        setIsSelectMode(false);
        setSelectedMessages(new Set());
    };

    return {
        isSelectMode,
        setIsSelectMode,
        selectedMessages,
        setSelectedMessages,
        isBulkDeleting,
        bulkDeleteConfirmOpen,
        setBulkDeleteConfirmOpen,
        canDeleteForEveryone,
        handleBulkDelete,
        toggleMessageSelection,
        exitSelectMode,
    };
};

export default useChatSelection;

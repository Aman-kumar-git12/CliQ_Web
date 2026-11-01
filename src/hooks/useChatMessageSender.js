/** Chat page sending: optimistic text/file/assistant messages over the socket, message edits and the composer submit. */
import * as chatApi from "../api/chat";

export const useChatMessageSender = ({
    socket,
    user,
    targetuserId,
    setMessages,
    setToast,
    setCanMessage,
    scrollToBottom,
    newMessage,
    setNewMessage,
    replyTo,
    setReplyTo,
    inputRef,
    updateMessage,
    setUpdateMessage,
    assistant,
    handleAISubmit,
}) => {
    const {
        showAIOverlay,
        setShowAIOverlay,
        aiInput,
        assistantData,
        setAssistantData,
        pendingAssistantHistory,
        setPendingAssistantHistory,
        saveAssistantHistory,
    } = assistant;

    const handleSendFailure = (tempId, response) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        setToast(response?.error || "Message not sent. Please try again.");
        if (response?.error === "You can only message your connections") setCanMessage(false);
    };

    const sendDirectMessage = (text, image = null, file = null, originalName = null) => {
        if (!socket || !user) return;

        const tempId = Date.now().toString();
        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                text,
                image,
                file,
                originalName,
                firstname: user.firstname,
                isMe: true,
                date: new Date(),
                imageUrl: user.imageUrl,
                parentMessage: null,
            },
        ]);

        socket.emit(
            "sendMessage",
            {
                firstname: user.firstname,
                userId: user.id,
                targetuserId,
                text,
                image,
                file,
                originalName,
                parentMessageId: null,
            },
            (response) => {
                if (!response?.success) return handleSendFailure(tempId, response);
                if (response.success && response.id) {
                    setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, id: response.id } : msg)));
                    // Notify Inbox to move this user to top
                    window.dispatchEvent(
                        new CustomEvent("chatUpdated", {
                            detail: { targetId: targetuserId, lastMessage: text || (image ? "Image" : "File") },
                        }),
                    );
                }
            },
        );
        setTimeout(() => scrollToBottom(), 50);
    };

    const handleUpdateMessage = async () => {
        if (!updateMessage || !newMessage.trim()) return;
        try {
            setMessages((prev) => prev.map((msg) => (msg.id === updateMessage ? { ...msg, text: newMessage } : msg)));
            const currentMsgId = updateMessage;
            setUpdateMessage(null);
            setNewMessage("");
            if (inputRef.current) inputRef.current.style.height = "auto";
            await chatApi.updateChatMessage(currentMsgId, { text: newMessage });
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const applyAssistantText = (text) => {
        if (!text) return;
        setNewMessage(text);
        setShowAIOverlay(false);
        if (assistantData) {
            setPendingAssistantHistory({
                snapshot: assistantData,
                replyText: text,
            });
        }
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.style.height = "auto";
                inputRef.current.style.height = inputRef.current.scrollHeight + "px";
            }
        }, 0);
    };

    const sendAssistantReply = (text) => {
        if (!socket || !user || !text?.trim()) return;

        const replyText = text.trim();
        const tempId = Date.now().toString();
        const parentMsg = replyTo ? { ...replyTo } : null;
        const assistantSnapshot = assistantData;
        setPendingAssistantHistory(null);

        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                text: replyText,
                firstname: user.firstname,
                isMe: true,
                date: new Date(),
                imageUrl: user.imageUrl,
                parentMessage: parentMsg,
            },
        ]);

        socket.emit(
            "sendMessage",
            {
                firstname: user.firstname,
                userId: user.id,
                targetuserId,
                text: replyText,
                image: null,
                file: null,
                parentMessageId: replyTo?.id,
            },
            (response) => {
                if (!response?.success) return handleSendFailure(tempId, response);
                if (response.success && response.id) {
                    setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, id: response.id } : msg)));
                    window.dispatchEvent(
                        new CustomEvent("chatUpdated", {
                            detail: { targetId: targetuserId, lastMessage: replyText },
                        }),
                    );
                    saveAssistantHistory(replyText, assistantSnapshot);
                }
            },
        );

        setReplyTo(null);
        setShowAIOverlay(false);
        setAssistantData(null);
        setNewMessage("");
        if (inputRef.current) inputRef.current.style.height = "auto";
        setTimeout(() => scrollToBottom(), 50);
    };

    const sendMessage = () => {
        if (showAIOverlay) {
            handleAISubmit(aiInput);
            return;
        }
        if (updateMessage) {
            handleUpdateMessage();
            return;
        }
        if (socket && (newMessage.trim() || replyTo)) {
            const text = newMessage.trim();
            const tempId = Date.now().toString();
            const parentMsg = replyTo ? { ...replyTo } : null;

            setMessages((prev) => [
                ...prev,
                {
                    id: tempId,
                    text: text,
                    firstname: user.firstname,
                    isMe: true,
                    date: new Date(),
                    imageUrl: user.imageUrl,
                    parentMessage: parentMsg,
                },
            ]);

            socket.emit(
                "sendMessage",
                {
                    firstname: user.firstname,
                    userId: user.id,
                    targetuserId,
                    text: text,
                    image: null,
                    file: null,
                    parentMessageId: replyTo?.id,
                },
                (response) => {
                    if (!response?.success) return handleSendFailure(tempId, response);
                    if (response.success && response.id) {
                        setMessages((prev) =>
                            prev.map((msg) => (msg.id === tempId ? { ...msg, id: response.id } : msg)),
                        );

                        // Notify Inbox to move this user to top
                        window.dispatchEvent(
                            new CustomEvent("chatUpdated", {
                                detail: { targetId: targetuserId, lastMessage: text },
                            }),
                        );

                        if (pendingAssistantHistory?.snapshot) {
                            saveAssistantHistory(text, pendingAssistantHistory.snapshot);
                        }
                    }
                },
            );

            setNewMessage("");
            setReplyTo(null);
            setPendingAssistantHistory(null);
            if (inputRef.current) inputRef.current.style.height = "auto";
            setTimeout(() => scrollToBottom(), 50);
        }
    };

    return { sendDirectMessage, applyAssistantText, sendAssistantReply, sendMessage };
};

export default useChatMessageSender;

import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useState, useRef, useMemo } from "react";
import LoadingChat from "../components/chat/LoadingChat";
import Toastbar from "../components/chat/Toastbar";
import { useUserContext } from "../context/UserContext";
import { AnimatePresence } from "framer-motion";
import AIAssistantOverlay from "../components/chat/AIAssistantOverlay";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatComposer from "../components/chat/ChatComposer";
import ChatSelectionBar from "../components/chat/ChatSelectionBar";
import ChatBulkDeleteDialog from "../components/chat/ChatBulkDeleteDialog";
import ChatDeleteMessageDialog from "../components/chat/ChatDeleteMessageDialog";
import ChatFilePreview from "../components/chat/ChatFilePreview";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useChatAssistant } from "../hooks/useChatAssistant";
import { useChatAssistantRequests } from "../hooks/useChatAssistantRequests";
import { useChatSelection } from "../hooks/useChatSelection";
import { useChatConversation } from "../hooks/useChatConversation";
import { useChatScroll } from "../hooks/useChatScroll";
import { useChatSocketEvents } from "../hooks/useChatSocketEvents";
import { useChatMessageMenu } from "../hooks/useChatMessageMenu";
import { useChatMessageSender } from "../hooks/useChatMessageSender";
import { useChatFileUpload } from "../hooks/useChatFileUpload";
import { useChatVoiceRecorder } from "../hooks/useChatVoiceRecorder";
import { useChatEmojiPicker } from "../hooks/useChatEmojiPicker";
import { EMPTY_CHAT_STICKERS } from "../utils/chatPageHelpers";

const ChatPage = () => {
    const navigate = useNavigate();
    const { targetuserId, actionParam } = useParams();
    const { user } = useUserContext();
    const socket = useSocket();

    // State shared by several of the chat hooks below
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [toast, setToast] = useState(null);
    const inputRef = useRef(null);

    const assistant = useChatAssistant({ targetuserId, actionParam, navigate, user });
    const selection = useChatSelection({ messages, setMessages, setToast, targetuserId });
    const { setIsSelectMode, setSelectedMessages, toggleMessageSelection } = selection;
    const { targetUser, canMessage, setCanMessage, loading } = useChatConversation({
        targetuserId,
        user,
        setMessages,
        setIsSelectMode,
        setSelectedMessages,
        setReplyTo,
        setNewMessage,
    });

    // Randomize sticker for empty chat
    const randomSticker = useMemo(() => {
        return EMPTY_CHAT_STICKERS[Math.floor(Math.random() * EMPTY_CHAT_STICKERS.length)];
        // targetuserId isn't read: it is here so each chat gets a fresh random sticker
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetuserId]);

    const stickerMessage = useMemo(() => {
        const name = targetUser?.firstname || "";
        return `Say ${randomSticker.type} to ${name}`;
    }, [randomSticker, targetUser]);

    const { scrollContainerRef, messagesEndRef, scrollToBottom } = useChatScroll({
        loading,
        messagesLength: messages.length,
        targetuserId,
    });
    const { isTargetOnline } = useChatSocketEvents({
        socket,
        user,
        targetuserId,
        targetUser,
        setMessages,
        scrollToBottom,
    });
    const menu = useChatMessageMenu({ setMessages, targetuserId, setNewMessage, inputRef });
    const { handleAssistantGenerate, handleAISubmit } = useChatAssistantRequests({
        assistant,
        targetuserId,
        newMessage,
    });
    const { sendDirectMessage, applyAssistantText, sendAssistantReply, sendMessage } = useChatMessageSender({
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
        updateMessage: menu.updateMessage,
        setUpdateMessage: menu.setUpdateMessage,
        assistant,
        handleAISubmit,
    });
    const upload = useChatFileUpload({ sendDirectMessage, setToast });
    const voice = useChatVoiceRecorder({ sendDirectMessage, setToast, setIsUploading: upload.setIsUploading });
    const emoji = useChatEmojiPicker({ setNewMessage });

    // Escape closes the delete confirmations and the file preview
    useEscapeKey(selection.bulkDeleteConfirmOpen, () => selection.setBulkDeleteConfirmOpen(false));
    useEscapeKey(menu.deleteConfirmation.isOpen, () => menu.closeDeleteConfirmation());
    useEscapeKey(Boolean(upload.selectedFile), () => upload.handleCancelFile());

    if (loading) return <LoadingChat />;

    return (
        <div
            className="h-full bg-[#040406] text-white flex flex-col relative overflow-hidden"
            onClick={() => menu.setOpenMenuId(null)}
        >
            {/* Extremely Subtle Ambient Purple Light */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.04),transparent_50%)]" />

            <AnimatePresence>
                {assistant.showAIOverlay && (
                    <AIAssistantOverlay
                        isOpen={assistant.showAIOverlay}
                        onClose={assistant.closeOverlay}
                        messages={assistant.aiMessages}
                        onNewAskChat={() => assistant.setAiMessages([])}
                        isLoading={assistant.isAILoading}
                        thinkingStep={assistant.aiThinkingStep}
                        title="AI Assistant"
                        subtitle="Messaging Co-pilot"
                        emptyTitle="Ask anything about this chat"
                        emptyDescription="Summaries, reply ideas, or context analysis."
                        inputValue={assistant.aiInput}
                        onInputChange={assistant.setAiInput}
                        onSubmit={() => handleAISubmit(assistant.aiInput)}
                        mode={assistant.aiOverlayMode}
                        onModeChange={assistant.setAiOverlayMode}
                        replyData={assistant.assistantData}
                        replyLoading={assistant.assistantLoading}
                        error={assistant.aiOverlayMode === "replies" ? assistant.assistantError : ""}
                        selectedTone={assistant.assistantTone}
                        onToneChange={assistant.setAssistantTone}
                        emojiPreference={assistant.emojiPreference}
                        onEmojiPreferenceChange={assistant.setEmojiPreference}
                        onGenerateReplies={handleAssistantGenerate}
                        onUseReply={applyAssistantText}
                        onSendReply={sendAssistantReply}
                        history={assistant.assistantHistory}
                        askHistory={assistant.assistantAskHistory}
                        onContinueAskHistory={assistant.handleContinueAskHistory}
                        onClearAskHistory={assistant.handleClearAskHistory}
                        onClearReplyHistory={assistant.handleClearReplyHistory}
                        onDeleteAskHistoryItem={assistant.handleDeleteAskHistoryItem}
                        onDeleteReplyHistoryItem={assistant.handleDeleteReplyHistoryItem}
                    />
                )}
            </AnimatePresence>

            {/* Premium Glass Header */}
            <ChatHeader targetUser={targetUser} isTargetOnline={isTargetOnline} onBack={() => navigate("/messages")} />

            {/* Chat Area */}
            <ChatMessageList
                scrollContainerRef={scrollContainerRef}
                messagesEndRef={messagesEndRef}
                messages={messages}
                randomSticker={randomSticker}
                stickerMessage={stickerMessage}
                onSendSticker={() => sendDirectMessage(stickerMessage)}
                targetUser={targetUser}
                openMenuId={menu.openMenuId}
                toggleMenu={menu.toggleMenu}
                handleEditStart={menu.handleEditStart}
                handleDeleteStart={menu.handleDeleteStart}
                onReply={(m) => {
                    setReplyTo({ id: m.id, text: m.text, firstname: m.firstname });
                    scrollToBottom();
                }}
                menuDirection={menu.menuDirection}
                isSelectMode={selection.isSelectMode}
                selectedMessages={selection.selectedMessages}
                toggleMessageSelection={toggleMessageSelection}
                onEnterSelectMode={(id) => {
                    setIsSelectMode(true);
                    toggleMessageSelection(id);
                }}
                setToast={setToast}
                setOpenMenuId={menu.setOpenMenuId}
                setSelectedMessages={setSelectedMessages}
            />

            {canMessage === false && (
                <footer className="shrink-0 z-30 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+24px)] bg-white/[0.03] backdrop-blur-3xl border-t border-white/10 text-center text-sm text-white/70">
                    You can message {targetUser?.firstname || "this user"} once you're connected.{" "}
                    <button
                        onClick={() => navigate(`/user/${targetuserId}`)}
                        className="text-purple-300 font-semibold hover:underline"
                    >
                        View profile
                    </button>
                </footer>
            )}

            {/* Input Bar */}
            {canMessage !== false && (
                <ChatComposer
                    fileInputRef={upload.fileInputRef}
                    onFileChange={upload.handleFileChange}
                    isUploading={upload.isUploading}
                    isRecording={voice.isRecording}
                    recordingTime={voice.recordingTime}
                    audioBlob={voice.audioBlob}
                    startRecording={voice.startRecording}
                    stopRecording={voice.stopRecording}
                    cancelRecording={voice.cancelRecording}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    showAIOverlay={assistant.showAIOverlay}
                    onOpenAssistant={() => assistant.setShowAIOverlay(true)}
                    inputRef={inputRef}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    updateMessage={menu.updateMessage}
                    sendMessage={sendMessage}
                    showEmojiPicker={emoji.showEmojiPicker}
                    setShowEmojiPicker={emoji.setShowEmojiPicker}
                    emojiPickerRef={emoji.emojiPickerRef}
                    onEmojiClick={emoji.onEmojiClick}
                />
            )}

            {/* Bottom Selection Bar */}
            {selection.isSelectMode && (
                <ChatSelectionBar
                    selectedCount={selection.selectedMessages.size}
                    isBulkDeleting={selection.isBulkDeleting}
                    onExit={selection.exitSelectMode}
                    onDelete={() => selection.setBulkDeleteConfirmOpen(true)}
                />
            )}

            {selection.bulkDeleteConfirmOpen && (
                <ChatBulkDeleteDialog
                    selectedCount={selection.selectedMessages.size}
                    canDeleteForEveryone={selection.canDeleteForEveryone}
                    onDelete={selection.handleBulkDelete}
                    onCancel={() => selection.setBulkDeleteConfirmOpen(false)}
                />
            )}

            {menu.deleteConfirmation.isOpen && (
                <ChatDeleteMessageDialog
                    canDeleteForEveryone={menu.deleteConfirmation.isMe}
                    onDelete={menu.confirmDelete}
                    onCancel={menu.closeDeleteConfirmation}
                />
            )}

            {toast && <Toastbar message={toast} onClose={() => setToast(null)} />}

            {/* WhatsApp-style Image/File Preview Overlay */}
            {upload.selectedFile && (
                <ChatFilePreview
                    selectedFile={upload.selectedFile}
                    filePreview={upload.filePreview}
                    fileCaption={upload.fileCaption}
                    setFileCaption={upload.setFileCaption}
                    isUploading={upload.isUploading}
                    onCancel={upload.handleCancelFile}
                    onSend={upload.handleSendFile}
                />
            )}

            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default ChatPage;

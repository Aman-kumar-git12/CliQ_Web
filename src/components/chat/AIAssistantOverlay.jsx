import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import AIAssistantConfirmDialog from "./AIAssistantConfirmDialog";
import AIAssistantHeader from "./AIAssistantHeader";
import AIAssistantHistoryPanel from "./AIAssistantHistoryPanel";
import AIAssistantAskThread from "./AIAssistantAskThread";
import AIAssistantReplyControls from "./AIAssistantReplyControls";
import AIAssistantReplyResults from "./AIAssistantReplyResults";
import AIAssistantComposer from "./AIAssistantComposer";
import { EASE_SOFT } from "../common/motionPresets";

export default function AIAssistantOverlay({
    isOpen,
    onClose,
    messages = [],
    isLoading,
    thinkingStep = "idle",
    title = "Message AI",
    subtitle = "Chat-aware assistant with messaging guidance",
    emptyTitle = "How can I help with this chat?",
    emptyDescription = "Ask about this conversation, get message ideas, or understand what the other person means.",
    inputValue = "",
    onInputChange,
    onSubmit,
    mode = "ask",
    onModeChange,
    replyData = null,
    replyLoading = false,
    error = "",
    selectedTone = "polite",
    onToneChange,
    emojiPreference = "both",
    onEmojiPreferenceChange,
    onGenerateReplies,
    onUseReply,
    onSendReply,
    history = [],
    askHistory = [],
    onContinueAskHistory,
    onNewAskChat,
    onClearAskHistory,
    onClearReplyHistory,
    onDeleteAskHistoryItem,
    onDeleteReplyHistoryItem,
}) {
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const [showHistoryToggle, setShowHistoryToggle] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [toneDropdownOpen, setToneDropdownOpen] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setShowHistoryToggle(false);
    }, [mode]);

    // Escape closes the delete confirmation first, then the assistant itself
    useEscapeKey(isOpen, () => {
        if (confirmAction) setConfirmAction(null);
        else onClose?.();
    });

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (confirmAction.type === "clear_ask") onClearAskHistory?.();
        else if (confirmAction.type === "clear_reply") onClearReplyHistory?.();
        else if (confirmAction.type === "delete_ask") onDeleteAskHistoryItem?.(confirmAction.id);
        else if (confirmAction.type === "delete_reply") onDeleteReplyHistoryItem?.(confirmAction.id);
        setConfirmAction(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.24, ease: EASE_SOFT }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            className="absolute inset-0 z-[100] flex flex-col bg-surface-950/90 backdrop-blur-2xl rounded-[28px] border border-line shadow-pop overflow-hidden"
        >
            {/* Confirmation Overlay */}
            <AIAssistantConfirmDialog
                confirmAction={confirmAction}
                mode={mode}
                onCancel={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
            />

            <AIAssistantHeader
                title={title}
                subtitle={subtitle}
                mode={mode}
                showHistoryToggle={showHistoryToggle}
                onToggleHistory={() => setShowHistoryToggle(!showHistoryToggle)}
                onClose={onClose}
                onModeChange={onModeChange}
            />

            {/* Content Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-6 custom-scrollbar"
            >
                {showHistoryToggle ? (
                    <AIAssistantHistoryPanel
                        mode={mode}
                        askHistory={askHistory}
                        history={history}
                        onRequestConfirm={setConfirmAction}
                        onHideHistory={() => setShowHistoryToggle(false)}
                        onNewAskChat={onNewAskChat}
                        onContinueAskHistory={onContinueAskHistory}
                    />
                ) : (
                    <>
                        <AIAssistantAskThread
                            mode={mode}
                            messages={messages}
                            isLoading={isLoading}
                            thinkingStep={thinkingStep}
                            emptyTitle={emptyTitle}
                            emptyDescription={emptyDescription}
                        />

                        {mode === "replies" && (
                            <div className="space-y-4">
                                <AIAssistantReplyControls
                                    selectedTone={selectedTone}
                                    onToneChange={onToneChange}
                                    toneDropdownOpen={toneDropdownOpen}
                                    setToneDropdownOpen={setToneDropdownOpen}
                                    emojiPreference={emojiPreference}
                                    onEmojiPreferenceChange={onEmojiPreferenceChange}
                                    onGenerateReplies={onGenerateReplies}
                                    replyLoading={replyLoading}
                                />
                                <AIAssistantReplyResults
                                    replyData={replyData}
                                    replyLoading={replyLoading}
                                    error={error}
                                    selectedTone={selectedTone}
                                    onGenerateReplies={onGenerateReplies}
                                    onUseReply={onUseReply}
                                    onSendReply={onSendReply}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer / Input */}
            {mode === "ask" && !showHistoryToggle && (
                <AIAssistantComposer
                    inputRef={inputRef}
                    inputValue={inputValue}
                    onInputChange={onInputChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            )}
        </motion.div>
    );
}

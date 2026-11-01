import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useChatbotSessions } from "../../hooks/useChatbotSessions";
import { useChatbotStream } from "../../hooks/useChatbotStream";
import { useChatbotFeedback } from "../../hooks/useChatbotFeedback";
import { DEFAULT_GREETING, STARTER_PROMPTS } from "./constants";
import ChatbotHeader from "./ChatbotHeader";
import ChatbotDeleteModal from "./ChatbotDeleteModal";
import ChatbotSessionSidebar from "./ChatbotSessionSidebar";
import ChatbotSkeletonMessage from "./ChatbotSkeletonMessage";
import ChatbotMessageBubble from "./ChatbotMessageBubble";
import ChatbotMessageActions from "./ChatbotMessageActions";
import ChatbotSuggestionChips from "./ChatbotSuggestionChips";
import ChatbotThinkingIndicator from "./ChatbotThinkingIndicator";
import ChatbotComposer from "./ChatbotComposer";

export default function Chatbot() {
    const { user: currentUser } = useUserContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([{ id: "greeting1", role: "ai", text: DEFAULT_GREETING }]);
    const location = useLocation();

    const {
        sessions,
        setSessions,
        activeSessionId,
        setActiveSessionId,
        deleteConfirm,
        closeDeleteConfirm,
        isHistoryLoading,
        isHistoryLoad,
        isCreatingSession,
        selectSession,
        handleCreateNewChat,
        requestDeleteSession,
        confirmDeleteSession,
        requestDeleteAll,
        confirmDeleteAll,
        refreshSessions,
    } = useChatbotSessions({ isOpen, currentUser, setMessages, setShowSidebar });

    const { isLoading, isBusy, status, streamAnswer, handleStop } = useChatbotStream({
        activeSessionId,
        setActiveSessionId,
        setSessions,
        setMessages,
        isCreatingSession,
        refreshSessions,
        currentPath: location.pathname,
    });

    const { copiedId, feedbackNote, setFeedbackNote, feedbackThanks, handleCopy, handleFeedback, submitFeedbackNote } =
        useChatbotFeedback({ setMessages });

    // Escape closes the delete confirmation first, then the chatbot panel
    useEscapeKey(isOpen, () => {
        if (deleteConfirm.isOpen) closeDeleteConfirm();
        else setIsOpen(false);
    });

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!showSidebar) {
            const behavior = isHistoryLoad.current ? "auto" : "smooth";
            messagesEndRef.current?.scrollIntoView({ behavior });
            isHistoryLoad.current = false;
        }
        // isHistoryLoad is a ref from useChatbotSessions (stable), so it is left out like before the extraction
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, showSidebar]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const userQuery = query.trim();
        if (!userQuery || isBusy) return;
        setQuery("");
        streamAnswer({ text: userQuery });
    };

    const handleRegenerate = (index) => {
        const previousQuestion = messages[index - 1];
        if (!previousQuestion || previousQuestion.role !== "user") return;
        streamAnswer({ text: previousQuestion.text, regenerate: true, replaceId: messages[index].id });
    };

    const handleSuggestion = (item) => streamAnswer({ text: item });

    const hasUserMessages = messages.some((msg) => msg.role === "user");
    const lastMessage = messages[messages.length - 1];

    return (
        <div className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="dialog"
                        aria-label="AI Assistant"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`mb-4 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative transition-[width,height] duration-300 ease-out ${
                            isExpanded
                                ? "w-[calc(100vw-1.5rem)] sm:w-[680px] h-[75vh] max-h-[820px]"
                                : "w-[340px] sm:w-[400px] h-[500px]"
                        }`}
                    >
                        <ChatbotHeader
                            showSidebar={showSidebar}
                            onToggleSidebar={() => setShowSidebar(!showSidebar)}
                            isExpanded={isExpanded}
                            onToggleExpanded={() => setIsExpanded((prev) => !prev)}
                            onClose={() => setIsOpen(false)}
                        />

                        <ChatbotDeleteModal
                            deleteConfirm={deleteConfirm}
                            onCancel={closeDeleteConfirm}
                            onConfirmSingle={confirmDeleteSession}
                            onConfirmAll={confirmDeleteAll}
                        />

                        {showSidebar ? (
                            <ChatbotSessionSidebar
                                sessions={sessions}
                                activeSessionId={activeSessionId}
                                isHistoryLoading={isHistoryLoading}
                                onCreateNewChat={handleCreateNewChat}
                                onSelectSession={selectSession}
                                onRequestDelete={requestDeleteSession}
                                onRequestDeleteAll={requestDeleteAll}
                            />
                        ) : (
                            /* Chat Body View */
                            <>
                                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#0d0d12]">
                                    {isHistoryLoading ? (
                                        <ChatbotSkeletonMessage />
                                    ) : (
                                        messages.map((msg, index) => {
                                            if (msg.role === "ai" && !msg.text) return null;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`max-w-[88%] ${msg.role === "user" ? "self-end" : "self-start"}`}
                                                >
                                                    {msg.role === "ai" && (
                                                        <div className="flex items-center gap-2 mb-1.5 px-1">
                                                            <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                                                                <Bot size={11} className="text-violet-300" />
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-[0.18em] text-violet-300/85 font-semibold">
                                                                CliQ AI
                                                            </span>
                                                        </div>
                                                    )}

                                                    <ChatbotMessageBubble msg={msg} />

                                                    {msg.role === "ai" && !(isBusy && msg === lastMessage) && (
                                                        <ChatbotMessageActions
                                                            msg={msg}
                                                            isAnswer={messages[index - 1]?.role === "user"}
                                                            isLast={msg === lastMessage}
                                                            isCopied={copiedId === msg.id}
                                                            feedbackThanks={feedbackThanks}
                                                            feedbackNote={feedbackNote}
                                                            onCopy={handleCopy}
                                                            onRegenerate={() => handleRegenerate(index)}
                                                            onFeedback={handleFeedback}
                                                            onFeedbackNoteChange={setFeedbackNote}
                                                            onSubmitFeedbackNote={submitFeedbackNote}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}

                                    {!isHistoryLoading && !isBusy && !hasUserMessages && (
                                        <ChatbotSuggestionChips items={STARTER_PROMPTS} onSelect={handleSuggestion} />
                                    )}
                                    {!isHistoryLoading &&
                                        !isBusy &&
                                        lastMessage?.role === "ai" &&
                                        lastMessage.suggestions?.length > 0 && (
                                            <ChatbotSuggestionChips
                                                items={lastMessage.suggestions}
                                                onSelect={handleSuggestion}
                                            />
                                        )}

                                    {isLoading && <ChatbotThinkingIndicator status={status} />}
                                    <div ref={messagesEndRef} />
                                </div>

                                <ChatbotComposer
                                    query={query}
                                    onQueryChange={setQuery}
                                    onSubmit={handleSubmit}
                                    isBusy={isBusy}
                                    onStop={handleStop}
                                />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                type="button"
                aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] border border-white/20 z-50 text-white relative overflow-hidden group"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X size={24} strokeWidth={2.5} /> : <Sparkles size={24} />}
            </motion.button>
        </div>
    );
}

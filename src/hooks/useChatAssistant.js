/** Chat page AI assistant state: overlay visibility synced with the URL, Ask-AI thread, reply suggestions and their histories. */
import { useEffect, useRef, useState } from "react";
import * as chatApi from "../api/chat";
import { buildAssistantGeneratedReplies, withAiMessageIds } from "../utils/chatPageHelpers";

export const useChatAssistant = ({ targetuserId, actionParam, navigate, user }) => {
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantError, setAssistantError] = useState("");
    const [assistantData, setAssistantData] = useState(null);
    const [assistantHistory, setAssistantHistory] = useState([]);
    const [assistantAskHistory, setAssistantAskHistory] = useState([]);
    const [pendingAssistantHistory, setPendingAssistantHistory] = useState(null);
    const [assistantTone, setAssistantTone] = useState("polite");
    const [emojiPreference, setEmojiPreference] = useState("both"); // 'both' | 'with' | 'without'

    // AI Assistant Overlay State
    const [showAIOverlay, setShowAIOverlay] = useState(
        () => actionParam === "ask_ai=true" || actionParam === "generate_reply=true",
    );
    const [aiMessages, setAiMessages] = useState([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiThinkingStep, setAiThinkingStep] = useState("idle");
    const [aiInput, setAiInput] = useState("");
    const [aiOverlayMode, setAiOverlayMode] = useState(() =>
        actionParam === "generate_reply=true" ? "replies" : "ask",
    );

    // Sync UI state changes -> URL
    useEffect(() => {
        if (!targetuserId) return;
        if (showAIOverlay) {
            if (aiOverlayMode === "ask" && actionParam !== "ask_ai=true") {
                navigate(`/messages/${targetuserId}/ask_ai=true`, { replace: true });
            } else if (aiOverlayMode === "replies" && actionParam !== "generate_reply=true") {
                navigate(`/messages/${targetuserId}/generate_reply=true`, { replace: true });
            }
        } else {
            if (actionParam) {
                navigate(`/messages/${targetuserId}`, { replace: true });
            }
        }
    }, [showAIOverlay, aiOverlayMode, targetuserId, actionParam, navigate]);

    // Sync URL param changes -> UI state (e.g. Browser Back/Forward)
    useEffect(() => {
        if (actionParam === "ask_ai=true") {
            setShowAIOverlay(true);
            setAiOverlayMode("ask");
        } else if (actionParam === "generate_reply=true") {
            setShowAIOverlay(true);
            setAiOverlayMode("replies");
        } else if (!actionParam) {
            setShowAIOverlay(false);
        }
    }, [actionParam]);

    const hasAutoLoadedLastChat = useRef(false);
    const thinkingStepTimerRef = useRef(null);

    // The AI "thinking" step timer must not keep running after leaving the chat
    useEffect(() => () => clearTimeout(thinkingStepTimerRef.current), []);

    // Moves the AI status from "analysing" to "thinking" after a short beat (cancelled once the request ends)
    const scheduleThinkingStep = () => {
        clearTimeout(thinkingStepTimerRef.current);
        thinkingStepTimerRef.current = setTimeout(() => setAiThinkingStep("thinking"), 800);
    };
    const cancelThinkingStep = () => clearTimeout(thinkingStepTimerRef.current);

    // Reset auto-load flag when AI Overlay closes
    useEffect(() => {
        if (!showAIOverlay) {
            hasAutoLoadedLastChat.current = false;
        }
    }, [showAIOverlay]);

    // Auto-load last Ask AI chat when overlay opens
    useEffect(() => {
        if (
            showAIOverlay &&
            aiOverlayMode === "ask" &&
            !hasAutoLoadedLastChat.current &&
            assistantAskHistory.length > 0 &&
            aiMessages.length === 0
        ) {
            hasAutoLoadedLastChat.current = true;
            const lastChat = assistantAskHistory[0];
            setAiMessages(
                withAiMessageIds(
                    lastChat.messages || [
                        { id: Date.now() + 1, type: "user", text: lastChat.question },
                        { id: Date.now() + 2, type: "ai", text: lastChat.answer, isComplete: true },
                    ],
                ),
            );
        }
    }, [showAIOverlay, aiOverlayMode, assistantAskHistory, aiMessages.length]);

    useEffect(() => {
        const controller = new AbortController(); // history of a previously opened chat is dropped
        const { signal } = controller;

        const loadAssistantHistory = async () => {
            if (!targetuserId || !user?.id) {
                setAssistantHistory([]);
                setAssistantAskHistory([]);
                return;
            }

            try {
                const data = await chatApi.getReplyHistory(targetuserId, { signal });
                setAssistantHistory(data.history || []);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Failed to load message assistant history:", error);
                setAssistantHistory([]);
            }

            try {
                const data = await chatApi.getAskHistory(targetuserId, { signal });
                setAssistantAskHistory(data.history || []);
            } catch (error) {
                if (signal.aborted) return;
                console.error("Failed to load Ask AI history:", error);
                setAssistantAskHistory([]);
            }
        };

        loadAssistantHistory();
        return () => controller.abort();
    }, [targetuserId, user?.id]);

    useEffect(() => {
        setAssistantData(null);
        setAssistantError("");
        setAssistantTone("polite");
        setAiMessages([]);
        setAiInput("");
        setAiOverlayMode("ask");
    }, [targetuserId]);

    const saveAssistantHistory = async (replyText, snapshot) => {
        if (!targetuserId || !replyText?.trim() || !snapshot) return;

        try {
            const data = await chatApi.saveReplyHistory(
                targetuserId,
                {
                    conversationId: snapshot.conversationId || snapshot.conversation_id || null,
                    contextSummary:
                        snapshot.context_preview ||
                        snapshot.context_focus ||
                        snapshot.conversation_summary ||
                        "No recent context available.",
                    lastMessage: snapshot.last_other_message || "",
                    sentReply: replyText,
                    tone: snapshot.tone || assistantTone,
                    detectedIntent: snapshot.detected_intent || "",
                    topReply: snapshot.top_reply || "",
                    generatedReplies: buildAssistantGeneratedReplies(snapshot),
                },
                { silent: true },
            ); // saving history happens in the background after a reply is sent

            if (data?.history) {
                setAssistantHistory((prev) => [data.history, ...prev].slice(0, 20));
            }
        } catch (error) {
            console.error("Failed to save message assistant history:", error);
        }
    };

    const saveAskAiHistory = async (questionText, answerText) => {
        if (!targetuserId || !user?.id || !questionText?.trim() || !answerText?.trim()) return;
        const historyPayload = {
            question: questionText.trim(),
            answer: answerText.trim(),
            messages: [
                { role: "user", text: questionText.trim() },
                { role: "ai", text: answerText.trim() },
            ],
        };
        try {
            const data = await chatApi.saveAskHistory(targetuserId, historyPayload, { silent: true });
            if (data?.history) {
                setAssistantAskHistory((prev) => [data.history, ...prev].slice(0, 20));
            }
        } catch (error) {
            console.error("Failed to save Ask AI history:", error);
        }
    };

    const handleContinueAskHistory = (historyItem) => {
        if (!historyItem) return;

        const restoredMessages =
            Array.isArray(historyItem.messages) && historyItem.messages.length > 0
                ? historyItem.messages
                : [
                      { role: "user", text: historyItem.question || "" },
                      { role: "ai", text: historyItem.answer || "" },
                  ].filter((item) => item.text);

        setAiOverlayMode("ask");
        setAiMessages(withAiMessageIds(restoredMessages));
        setAiInput("");
        setShowAIOverlay(true);
    };

    const handleClearAskHistory = async () => {
        if (!targetuserId || !user?.id) return;

        try {
            await chatApi.clearAskHistory(targetuserId);
            setAssistantAskHistory([]);
            setAiMessages([]);
        } catch (error) {
            console.error("Failed to clear Ask AI history:", error);
        }
    };

    const handleClearReplyHistory = async () => {
        if (!targetuserId) return;

        try {
            await chatApi.clearReplyHistory(targetuserId);
            setAssistantHistory([]);
        } catch (error) {
            console.error("Failed to clear reply history:", error);
        }
    };

    const handleDeleteAskHistoryItem = async (historyId) => {
        if (!historyId || !targetuserId || !user?.id) return;
        try {
            await chatApi.deleteAskHistoryItem(targetuserId, historyId);
            setAssistantAskHistory((prev) => prev.filter((item) => item.id !== historyId));
        } catch (error) {
            console.error("Failed to delete Ask AI history item:", error);
        }
    };

    const handleDeleteReplyHistoryItem = async (historyId) => {
        if (!historyId || !targetuserId) return;

        try {
            await chatApi.deleteReplyHistoryItem(targetuserId, historyId);
            setAssistantHistory((prev) => prev.filter((item) => item.id !== historyId));
        } catch (error) {
            console.error("Failed to delete reply history item:", error);
        }
    };

    const closeOverlay = () => {
        setShowAIOverlay(false);
        setAssistantData(null);
        setAiMessages([]);
        setAssistantError("");
        setAiInput("");
        setAiOverlayMode("ask");
    };

    return {
        assistantLoading,
        setAssistantLoading,
        assistantError,
        setAssistantError,
        assistantData,
        setAssistantData,
        assistantHistory,
        assistantAskHistory,
        pendingAssistantHistory,
        setPendingAssistantHistory,
        assistantTone,
        setAssistantTone,
        emojiPreference,
        setEmojiPreference,
        showAIOverlay,
        setShowAIOverlay,
        aiMessages,
        setAiMessages,
        isAILoading,
        setIsAILoading,
        aiThinkingStep,
        setAiThinkingStep,
        aiInput,
        setAiInput,
        aiOverlayMode,
        setAiOverlayMode,
        scheduleThinkingStep,
        cancelThinkingStep,
        saveAssistantHistory,
        saveAskAiHistory,
        handleContinueAskHistory,
        handleClearAskHistory,
        handleClearReplyHistory,
        handleDeleteAskHistoryItem,
        handleDeleteReplyHistoryItem,
        closeOverlay,
    };
};

export default useChatAssistant;

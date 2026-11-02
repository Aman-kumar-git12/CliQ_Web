/** Chat page AI requests: generate reply suggestions and stream Ask-AI answers into the assistant state. */
import { apiBaseUrl, fetchWithSession } from "../api/axiosClient";
import * as chatApi from "../api/chat";
import { nextAiMessageId } from "../utils/chatPageHelpers";

export const useChatAssistantRequests = ({ assistant, targetuserId, newMessage }) => {
    const {
        showAIOverlay,
        setShowAIOverlay,
        aiInput,
        setAiInput,
        setAiOverlayMode,
        setAssistantLoading,
        setAssistantError,
        setAssistantData,
        setAiThinkingStep,
        scheduleThinkingStep,
        cancelThinkingStep,
        assistantTone,
        emojiPreference,
        saveAssistantHistory,
        saveAskAiHistory,
        aiMessages,
        setAiMessages,
        isAILoading,
        setIsAILoading,
    } = assistant;

    const buildAskAiContextWindow = () => {
        const recentTurns = [...aiMessages]
            .filter((message) => message?.role === "user" || message?.role === "ai")
            .slice(-10)
            .map((message) => ({
                role: message.role === "user" ? "user" : "ai",
                text: String(message.text || "").trim(),
            }))
            .filter((message) => message.text);

        return recentTurns;
    };

    const handleAssistantGenerate = async () => {
        if (!targetuserId) return;
        const activeDraft = showAIOverlay ? aiInput : newMessage;

        setShowAIOverlay(true);
        setAiOverlayMode("replies");
        setAssistantLoading(true);
        setAssistantError("");
        setAssistantData(null);
        setAiThinkingStep("analysing");
        scheduleThinkingStep();

        try {
            const data = await chatApi.getReplySuggestions(
                targetuserId,
                {
                    mode: "replies",
                    draft: activeDraft,
                    tone: assistantTone,
                    emojiPreference,
                },
                { silent: true },
            );
            setAiThinkingStep("generating");
            setAssistantData(data);
            setAiThinkingStep("idle");

            // Save the generation to history immediately
            if (data) {
                saveAssistantHistory(data.top_reply || activeDraft || "Generated Reply", data);
            }
        } catch (error) {
            console.error("Message assistant failed:", error);
            setAssistantError("Could not load message suggestions right now.");
            setAiThinkingStep("idle");
        } finally {
            cancelThinkingStep();
            setAssistantLoading(false);
        }
    };

    const handleAISubmit = async (query) => {
        if (!query.trim() || isAILoading) return;

        const userQuery = query.trim();
        setAiInput("");

        setAiMessages((prev) => [
            ...prev,
            { id: nextAiMessageId(), role: "user", text: userQuery },
            { id: nextAiMessageId(), role: "ai", text: "" },
        ]);
        setIsAILoading(true);
        setAiThinkingStep("analysing");
        scheduleThinkingStep();

        try {
            const response = await fetchWithSession(`${apiBaseUrl}/message-ai/conversation/stream/${targetuserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "ask",
                    question: userQuery,
                    tone: assistantTone,
                    assistant_history: buildAskAiContextWindow(),
                }),
            });

            if (!response.ok) throw new Error("API request failed");
            if (!response.body) throw new Error("AI stream did not return a readable response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullAiAnswer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (fullAiAnswer === "") {
                    setAiThinkingStep("generating");
                }
                const chunk = decoder.decode(value, { stream: true });
                fullAiAnswer += chunk;

                setAiMessages((prev) => {
                    const last = prev[prev.length - 1];
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...last, text: fullAiAnswer };
                    return updated;
                });
                if (fullAiAnswer.length > 50) setAiThinkingStep("refining");
            }
            if (fullAiAnswer.trim()) {
                await saveAskAiHistory(userQuery, fullAiAnswer);
            }
            setAiThinkingStep("idle");
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setAiMessages((prev) => {
                const last = prev[prev.length - 1];
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...last,
                    text: "I encountered an error while processing your request. Please try again later.",
                };
                return updated;
            });
        } finally {
            cancelThinkingStep();
            setIsAILoading(false);
            setAiThinkingStep("idle");
        }
    };

    return { handleAssistantGenerate, handleAISubmit };
};

export default useChatAssistantRequests;

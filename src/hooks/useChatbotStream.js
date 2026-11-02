/** Chatbot answer streaming: sends a question (or regenerates) and streams the reply over SSE with smooth typing. */
import { useEffect, useRef, useState } from "react";
import * as aiChatApi from "../api/aiChat";
import { apiBaseUrl, fetchWithSession } from "../api/axiosClient";
import { httpErrorMessage, NETWORK_ERROR } from "../components/chatbot/constants";
import { readSseEvents } from "../utils/readSseEvents";

export const useChatbotStream = ({
    activeSessionId,
    setActiveSessionId,
    setSessions,
    setMessages,
    isCreatingSession,
    refreshSessions,
    currentPath,
}) => {
    const [isLoading, setIsLoading] = useState(false); // waiting for the first token
    const [isStreaming, setIsStreaming] = useState(false);
    const [status, setStatus] = useState("");
    const drainTimerRef = useRef(null);
    const abortRef = useRef(null);
    const isBusy = isLoading || isStreaming;

    // The typing timer (and an in-flight answer stream) must not outlive the chatbot
    useEffect(
        () => () => {
            clearInterval(drainTimerRef.current);
            abortRef.current?.abort();
        },
        [],
    );

    // Sends a question (or regenerates the last answer) and streams the reply over SSE
    const streamAnswer = async ({ text, regenerate = false, replaceId = null }) => {
        if (isBusy) return;

        const aiMsgId = `ai-${Date.now()}`;
        if (regenerate) {
            setMessages((prev) =>
                prev.map((msg) => (msg.id === replaceId ? { id: aiMsgId, role: "ai", text: "" } : msg)),
            );
        } else {
            setMessages((prev) => [
                ...prev,
                { id: `user-${Date.now()}`, role: "user", text },
                { id: aiMsgId, role: "ai", text: "" },
            ]);
        }
        const updateAiMessage = (patch) =>
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, ...(typeof patch === "function" ? patch(msg) : patch) } : msg,
                ),
            );

        setStatus("");
        setIsLoading(true);
        const controller = new AbortController();
        abortRef.current = controller;

        // Smooth typing: tokens go into a buffer that drains every 10ms
        let buffer = "";
        let isStreamDone = false;
        const drained = new Promise((resolve) => {
            const timer = setInterval(() => {
                if (buffer.length > 0) {
                    const charsToDrain = Math.max(1, Math.floor(buffer.length / 50));
                    const nextChars = buffer.slice(0, charsToDrain);
                    buffer = buffer.slice(charsToDrain);
                    updateAiMessage((msg) => ({ text: msg.text + nextChars }));
                } else if (isStreamDone) {
                    clearInterval(timer);
                    resolve();
                }
            }, 10);
            drainTimerRef.current = timer;
        });

        let receivedText = false;
        let suggestions = [];
        let doneMeta = null;
        let stopped = false;
        let errorInfo = null;

        try {
            let targetSessionId = activeSessionId;
            if (!targetSessionId) {
                isCreatingSession.current = true;
                const created = await aiChatApi.createAiChatSession();
                targetSessionId = created.session.id;
                setActiveSessionId(targetSessionId);
                setSessions((prev) => [created.session, ...prev]);
            }

            const response = await fetchWithSession(`${apiBaseUrl}/aichat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    sessionId: targetSessionId,
                    message: text,
                    currentPath,
                    regenerate,
                }),
            });
            if (!response.ok || !response.body) {
                const body = await response.json().catch(() => ({}));
                throw Object.assign(new Error(`AI stream failed with ${response.status}`), {
                    userError: httpErrorMessage(response.status, body),
                });
            }

            for await (const { event, data } of readSseEvents(response.body)) {
                if (event === "status") {
                    setStatus(data.text || "");
                } else if (event === "token") {
                    if (!receivedText) {
                        receivedText = true;
                        setIsLoading(false);
                        setIsStreaming(true);
                    }
                    buffer += data.text || "";
                } else if (event === "suggestions") {
                    suggestions = Array.isArray(data.items) ? data.items.slice(0, 3) : [];
                } else if (event === "done") {
                    doneMeta = data;
                } else if (event === "error") {
                    // The message itself already arrived as tokens; this marks the reply as an error
                    errorInfo = {
                        kind: data.kind || null,
                        retryAt: data.retryAfter ? Date.now() + data.retryAfter * 1000 : null,
                    };
                }
            }
        } catch (error) {
            if (error.name === "AbortError") {
                stopped = true;
            } else {
                console.error("Chat Error:", error);
                // fetch failures carry userError; axios failures (e.g. creating the session) carry a response
                const userError =
                    error.userError ||
                    (error.response
                        ? httpErrorMessage(error.response.status, error.response.data)
                        : { kind: "network", text: NETWORK_ERROR });
                if (!receivedText) buffer = userError.text;
                errorInfo = { kind: userError.kind, retryAt: null };
            }
        } finally {
            isStreamDone = true;
            setIsLoading(false);
            setIsStreaming(true);
            await drained;
            updateAiMessage({
                dbId: doneMeta?.messageId || null,
                suggestions: stopped || errorInfo ? [] : suggestions,
                stopped,
                feedback: null,
                error: errorInfo,
            });
            setIsStreaming(false);
            setStatus("");
            abortRef.current = null;
            refreshSessions();
        }
    };

    const handleStop = () => abortRef.current?.abort();

    return { isLoading, isBusy, status, streamAnswer, handleStop };
};

export default useChatbotStream;

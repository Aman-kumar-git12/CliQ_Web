/** Chatbot sessions: the session list, the active session's history, and new/delete chat actions. */
import { useCallback, useEffect, useRef, useState } from "react";
import * as aiChatApi from "../api/aiChat";
import { DEFAULT_GREETING } from "../components/chatbot/constants";

export const useChatbotSessions = ({ isOpen, currentUser, setMessages, setShowSidebar }) => {
    // Multi-session states
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null });
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Stable identity (no deps), so effects can depend on it without refetching every render
    const loadSessions = useCallback(async (isCancelled = () => false) => {
        try {
            const data = await aiChatApi.getAiChatSessions();
            if (isCancelled()) return; // e.g. the user changed while this was loading
            setSessions(data.sessions || []);
            // Set first session as active if none selected
            if (data.sessions?.length > 0) {
                setActiveSessionId((current) => current || data.sessions[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    }, []);

    // Fetch all sessions when chatbot opens
    useEffect(() => {
        if (!isOpen || !currentUser) return undefined;
        let cancelled = false;
        loadSessions(() => cancelled);
        return () => {
            cancelled = true;
        };
    }, [isOpen, currentUser, loadSessions]);

    const isHistoryLoad = useRef(false);
    const isCreatingSession = useRef(false);

    // Fetch specific chat history when active session changes
    useEffect(() => {
        if (!isOpen || !currentUser) return;
        // Switching sessions quickly: only the last selected session's history may land
        const controller = new AbortController();

        const loadHistory = async () => {
            if (isCreatingSession.current) {
                isCreatingSession.current = false;
                return;
            }

            if (!activeSessionId) {
                // Initial fresh state
                isHistoryLoad.current = true;
                setMessages([{ id: "g1", role: "ai", text: DEFAULT_GREETING }]);
                return;
            }

            setIsHistoryLoading(true);
            try {
                const data = await aiChatApi.getAiChatHistory(activeSessionId, { signal: controller.signal });
                isHistoryLoad.current = true;
                if (data.messages && data.messages.length > 0) {
                    const historyMessages = data.messages.map((msg) => ({
                        id: msg.id,
                        dbId: msg.id,
                        role: msg.role,
                        text: msg.text,
                        feedback: msg.feedback ?? null,
                        error: msg.isError ? { kind: null, retryAt: null } : null,
                    }));
                    setMessages(historyMessages);
                } else {
                    setMessages([{ id: "g2", role: "ai", text: DEFAULT_GREETING }]);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Failed to load chat history:", error);
            } finally {
                if (!controller.signal.aborted) setIsHistoryLoading(false);
            }
        };

        loadHistory();
        return () => controller.abort();
        // setMessages is the parent's useState setter (stable), so it is left out like before the extraction
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId, isOpen, currentUser]);

    const closeDeleteConfirm = () => setDeleteConfirm({ isOpen: false, id: null, type: null });

    const selectSession = (id) => {
        setActiveSessionId(id);
        setShowSidebar(false);
    };

    const handleCreateNewChat = () => {
        setActiveSessionId(null);
        setShowSidebar(false);
        setMessages([{ id: "g3", role: "ai", text: DEFAULT_GREETING }]);
    };

    const requestDeleteSession = (e, id) => {
        e.stopPropagation();
        setDeleteConfirm({ isOpen: true, id, type: "single" });
    };

    const confirmDeleteSession = async () => {
        const id = deleteConfirm.id;
        try {
            await aiChatApi.deleteAiChatSession(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
            if (activeSessionId === id) {
                setActiveSessionId(null);
                setMessages([{ id: "g4", role: "ai", text: `Chat deleted. ${DEFAULT_GREETING}` }]);
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, type: null });
        }
    };

    const requestDeleteAll = () => {
        setDeleteConfirm({ isOpen: true, id: null, type: "all" });
    };

    const confirmDeleteAll = async () => {
        try {
            await aiChatApi.deleteAllAiChatSessions();
            setSessions([]);
            setActiveSessionId(null);
            setMessages([{ id: "g5", role: "ai", text: `All history cleared. ${DEFAULT_GREETING}` }]);
        } catch (error) {
            console.error("Failed to clear all history", error);
        } finally {
            setDeleteConfirm({ isOpen: false, id: null, type: null });
        }
    };

    const refreshSessions = () =>
        aiChatApi
            .getAiChatSessions()
            .then((data) => setSessions(data.sessions || []))
            .catch((err) => console.error("Failed to refresh sessions:", err));

    return {
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
    };
};

export default useChatbotSessions;

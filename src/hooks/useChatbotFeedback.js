/** Chatbot answer actions: copy-to-clipboard state plus thumbs up/down feedback with an optional note. */
import { useEffect, useRef, useState } from "react";
import * as aiChatApi from "../api/aiChat";
import { FEEDBACK_NOTE_THANKS, FEEDBACK_THANKS, THANKS_VISIBLE_MS } from "../components/chatbot/constants";

export const useChatbotFeedback = ({ setMessages }) => {
    const [copiedId, setCopiedId] = useState(null);
    const [feedbackNote, setFeedbackNote] = useState({ id: null, text: "" });
    const [feedbackThanks, setFeedbackThanks] = useState({ id: null, text: "" });
    const thanksTimerRef = useRef(null);
    const copiedTimerRef = useRef(null);

    // Timers must not outlive the chatbot
    useEffect(
        () => () => {
            clearTimeout(thanksTimerRef.current);
            clearTimeout(copiedTimerRef.current);
        },
        [],
    );

    const handleCopy = async (msg) => {
        try {
            await navigator.clipboard.writeText(msg.text);
            setCopiedId(msg.id);
            clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(
                () => setCopiedId((current) => (current === msg.id ? null : current)),
                1500,
            );
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };

    // Returns true when the rating was saved, so "thank you" is only shown for real
    const sendFeedback = async (msg, value, note = null) => {
        const previous = msg.feedback ?? null;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, feedback: value } : m)));
        try {
            await aiChatApi.sendAiMessageFeedback(msg.dbId, { feedback: value, note });
            return true;
        } catch (error) {
            console.error("Feedback failed:", error);
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, feedback: previous } : m)));
            return false;
        }
    };

    const showFeedbackThanks = (id, text) => {
        clearTimeout(thanksTimerRef.current);
        setFeedbackThanks({ id, text });
        thanksTimerRef.current = setTimeout(() => setFeedbackThanks({ id: null, text: "" }), THANKS_VISIBLE_MS);
    };

    const handleFeedback = async (msg, value) => {
        if (msg.feedback === value) {
            // Clicking the active thumb again clears the rating
            setFeedbackNote({ id: null, text: "" });
            setFeedbackThanks({ id: null, text: "" });
            sendFeedback(msg, null);
            return;
        }
        setFeedbackNote(value === -1 ? { id: msg.id, text: "" } : { id: null, text: "" });
        if (await sendFeedback(msg, value)) showFeedbackThanks(msg.id, FEEDBACK_THANKS);
    };

    const submitFeedbackNote = async (e, msg) => {
        e.preventDefault();
        const note = feedbackNote.text.trim();
        setFeedbackNote({ id: null, text: "" });
        if (note && (await sendFeedback(msg, -1, note))) showFeedbackThanks(msg.id, FEEDBACK_NOTE_THANKS);
    };

    return { copiedId, feedbackNote, setFeedbackNote, feedbackThanks, handleCopy, handleFeedback, submitFeedbackNote };
};

export default useChatbotFeedback;

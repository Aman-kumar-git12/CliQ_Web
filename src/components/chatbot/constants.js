/** Chatbot texts, labels and small helpers for turning failures into user-facing messages. */

export const DEFAULT_GREETING = "Hi, I am CliQ AI. How can I help you today? 🙂";
export const NETWORK_ERROR = "Couldn't connect to CliQ AI. Check your internet connection and try again.";
export const ERROR_LABELS = {
    daily_limit: "Usage limit reached",
    busy: "High traffic",
    unreachable: "CliQ AI offline",
    network: "Connection problem",
    setup: "Temporarily unavailable",
    timeout: "Timed out",
    provider_down: "Service problem",
    bad_request: "Couldn't process",
    auth: "Session expired",
};

// A specific message for each way the request itself can fail (the agent explains its own errors)
export const httpErrorMessage = (status, body) => {
    if (status === 401)
        return { kind: "auth", text: "Your session has expired. Please log in again to keep chatting." };
    if (status === 404)
        return { kind: "bad_request", text: "This chat no longer exists. Start a new chat and ask again." };
    if (status === 429)
        return { kind: "busy", text: "You're sending messages too quickly. Please wait a minute and try again." };
    // The backend sends { message }; older versions sent { error }
    const reason = body?.message || body?.error;
    if (status === 400)
        return {
            kind: "bad_request",
            text: reason ? `${reason}.` : "That message couldn't be sent. Please try rephrasing it.",
        };
    return { kind: "provider_down", text: "CliQ AI's server had a problem. Please try again in a few minutes." };
};

export const formatRetryTime = (retryAt) =>
    new Date(retryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const FEEDBACK_THANKS = "Thank you for your feedback!";
export const FEEDBACK_NOTE_THANKS = "Thanks! We'll use this to improve CliQ AI.";
export const THANKS_VISIBLE_MS = 3000;
export const STARTER_PROMPTS = [
    "How do I find people?",
    "How do I create a post?",
    "How do smart connections work?",
    "I forgot my password",
];

export const actionButtonClass =
    "p-1.5 rounded-md text-ink-300 hover:text-neutral-200 hover:bg-white/[0.06] transition-colors duration-150 ease-soft focus-ring";

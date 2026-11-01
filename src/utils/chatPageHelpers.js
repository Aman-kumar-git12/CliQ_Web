/** Constants and small helpers for the one-to-one chat page (stickers, Ask-AI message ids, downloads, timers). */

export const EMPTY_CHAT_STICKERS = [
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp", type: "Hii" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.webp", type: "Hii" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.webp", type: "Hello" },
    { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.webp", type: "Hii" },
];

// Ask-AI messages get a client-side id once, so the overlay can key its list on it
let aiMessageSeq = 0;
export const nextAiMessageId = () => `ai-msg-${Date.now()}-${++aiMessageSeq}`;
export const withAiMessageIds = (list) => list.map((m) => (m.id ? m : { ...m, id: nextAiMessageId() }));

// Recording clock shown in the composer while a voice message is recorded (mm:ss)
export const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Every distinct reply text the message assistant produced for a snapshot (saved with the reply history)
export const buildAssistantGeneratedReplies = (snapshot) => {
    if (!snapshot) return [];

    return [
        snapshot.top_reply,
        ...(snapshot.reply_suggestions || []),
        ...(snapshot.emoji_replies_with_emojis || []),
        ...(snapshot.emoji_replies_without_emojis || []),
        ...(snapshot.emoji_replies || []),
        ...(snapshot.same_message_variants || []),
        snapshot.grouped_replies?.top_reply,
        snapshot.grouped_replies?.safe_reply,
        snapshot.grouped_replies?.warm_reply,
        snapshot.grouped_replies?.playful_reply,
        snapshot.grouped_replies?.curious_reply,
        snapshot.grouped_replies?.direct_reply,
        snapshot.rewrites?.clean,
        snapshot.rewrites?.short,
        snapshot.rewrites?.warm,
        snapshot.rewrites?.confident,
    ].filter((item, index, arr) => item && arr.indexOf(item) === index);
};

export const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Download failed:", error);
        window.open(url, "_blank"); // fallback
    }
};

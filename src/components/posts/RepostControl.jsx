import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Repeat2, Quote, X, Loader2 } from "lucide-react";
import MentionTextarea from "./MentionTextarea";
import EmbeddedPost from "./EmbeddedPost";
import { FADE_IN, FOCUS_RING, ICON_FEEDBACK, MENU, MENU_ITEM, PRESS, SOFT_TRANSITION } from "./postUi";

const MAX_LENGTH = 500;

const QuoteModal = ({ post, currentUserId, onClose, onSubmit }) => {
    const [text, setText] = useState("");
    const [mentionIds, setMentionIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const submit = async () => {
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            await onSubmit(text.trim(), mentionIds);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't post your quote");
            setSubmitting(false);
        }
    };

    return createPortal(
        <div
            className={`fixed inset-0 z-modal flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-20 md:pt-4 ${FADE_IN}`}
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-post-title"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[520px] rounded-2xl border border-line-strong bg-surface-raised p-5 shadow-pop"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 id="quote-post-title" className="text-[14px] font-black uppercase tracking-wider text-white">
                        Quote post
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className={`p-1.5 rounded-full hover:bg-white/10 text-ink-300 hover:text-white ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        <X size={16} />
                    </button>
                </div>
                <MentionTextarea
                    autoFocus
                    value={text}
                    onChange={setText}
                    onMentionIdsChange={setMentionIds}
                    maxLength={MAX_LENGTH}
                    rows={3}
                    placeholder="Add your thoughts… use @ to mention, # for topics"
                    aria-label="Add your thoughts"
                    className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-white placeholder-ink-400 focus-ring rounded-lg mb-3"
                />
                <EmbeddedPost post={post} currentUserId={currentUserId} clickable={false} />
                {error && <p className="text-[12px] text-red-400 mb-2">{error}</p>}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-ink-300 tabular-nums">
                        {text.length}/{MAX_LENGTH}
                    </span>
                    <button
                        onClick={submit}
                        disabled={!text.trim() || submitting}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full bg-brand hover:bg-brand/85 text-white text-[13px] font-bold disabled:opacity-50 disabled:pointer-events-none ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />} Post
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

/**
 * Repost button with a small menu: Repost / Undo repost, and Quote.
 * `actions` comes from usePostActions(post).
 */
export default function RepostControl({ post, actions, currentUserId, size = 16, showCount = true, className = "" }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [quoting, setQuoting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => !ref.current?.contains(e.target) && setMenuOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [menuOpen]);

    const { isReposted, repostsCount, toggleRepost, quote, busy } = actions;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                }}
                disabled={busy}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Repost options${showCount ? `, ${repostsCount} reposts` : ""}`}
                className={`group flex items-center gap-1.5 rounded-full hover:bg-emerald-500/10 ${isReposted ? "text-emerald-400" : "text-ink-300 hover:text-emerald-400"} ${SOFT_TRANSITION} ${FOCUS_RING} ${className || "-mx-1.5 px-1.5 py-1"}`}
            >
                <Repeat2 size={size} className={ICON_FEEDBACK} />
                {showCount && <span className="text-[12px] font-bold tabular-nums">{repostsCount}</span>}
            </button>

            {menuOpen && (
                <div role="menu" className={`${MENU} absolute bottom-full left-0 mb-2 w-44 ${FADE_IN}`}>
                    <button
                        role="menuitem"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            toggleRepost();
                        }}
                        className={`${MENU_ITEM} text-white hover:bg-white/[0.06]`}
                    >
                        <Repeat2 size={15} className={isReposted ? "text-emerald-400" : ""} />{" "}
                        {isReposted ? "Undo repost" : "Repost"}
                    </button>
                    <button
                        role="menuitem"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setQuoting(true);
                        }}
                        className={`${MENU_ITEM} text-white hover:bg-white/[0.06]`}
                    >
                        <Quote size={15} /> Quote
                    </button>
                </div>
            )}

            {quoting && (
                <QuoteModal
                    post={post}
                    currentUserId={currentUserId}
                    onClose={() => setQuoting(false)}
                    onSubmit={quote}
                />
            )}
        </div>
    );
}

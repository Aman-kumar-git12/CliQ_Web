import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Repeat2, Quote, X, Loader2 } from "lucide-react";
import MentionTextarea from "./MentionTextarea";
import EmbeddedPost from "./EmbeddedPost";

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
            className="fixed inset-0 z-[200] flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-20 md:pt-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-post-title"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-surface-750 p-4 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 id="quote-post-title" className="text-[14px] font-black uppercase tracking-wider text-white">
                        Quote post
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 rounded-full hover:bg-white/10 text-ink-350 hover:text-white"
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
                    className="w-full resize-none bg-transparent text-[14px] text-white placeholder-ink-450 focus:outline-none mb-3"
                />
                <EmbeddedPost post={post} currentUserId={currentUserId} clickable={false} />
                {error && <p className="text-[12px] text-red-400 mb-2">{error}</p>}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-ink-450">
                        {text.length}/{MAX_LENGTH}
                    </span>
                    <button
                        onClick={submit}
                        disabled={!text.trim() || submitting}
                        className="flex items-center gap-2 px-5 py-2 rounded-full bg-brand hover:bg-[#7c3aed] text-white text-[13px] font-bold disabled:opacity-50"
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
                className={`flex items-center gap-2 transition group ${isReposted ? "text-emerald-400" : "text-ink-350 hover:text-emerald-400"} ${className}`}
            >
                <Repeat2 size={size} className="group-hover:scale-110 transition-transform" />
                {showCount && <span className="text-[11px] font-black">{repostsCount}</span>}
            </button>

            {menuOpen && (
                <div
                    role="menu"
                    className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-white/10 bg-surface-750 shadow-2xl z-50 overflow-hidden"
                >
                    <button
                        role="menuitem"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            toggleRepost();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/5"
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
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-bold text-white hover:bg-white/5"
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

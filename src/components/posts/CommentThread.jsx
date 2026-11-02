import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, MoreHorizontal, Trash2, Flag, Loader2 } from "lucide-react";
import RichText from "./RichText";
import MentionTextarea from "./MentionTextarea";
import { timeAgo } from "../../utils/timeAgo";
import { DEFAULT_AVATAR } from "../../utils/avatar";

const CommentRow = ({ comment, isReply, currentUser, onReply, onDelete, onReport, onProfileEnter, onProfileLeave }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const profilePath = currentUser?.id === comment.userId ? "/profile" : `/public-profile/${comment.userId}`;
    const avatarSize = isReply ? "w-8 h-8" : "w-10 h-10";

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [menuOpen]);

    return (
        <div className="flex space-x-3">
            <Link
                to={profilePath}
                onMouseEnter={(e) => onProfileEnter(e, comment.userId)}
                onMouseLeave={onProfileLeave}
                className="shrink-0"
            >
                <img
                    loading="lazy"
                    decoding="async"
                    src={comment.avatar || DEFAULT_AVATAR}
                    alt={comment.username || "Anonymous"}
                    className={`${avatarSize} rounded-full object-cover`}
                />
            </Link>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                        <Link
                            to={profilePath}
                            onMouseEnter={(e) => onProfileEnter(e, comment.userId)}
                            onMouseLeave={onProfileLeave}
                            className="font-bold text-[14px] text-white hover:underline truncate"
                        >
                            {comment.username || "Anonymous"}
                        </Link>
                        <span className="text-ink-350 text-[13px] truncate">@{comment.handle}</span>
                        <span className="text-ink-350 text-[13px]">·</span>
                        <span
                            className="text-ink-350 text-[13px] shrink-0"
                            title={new Date(comment.createdAt).toLocaleString()}
                        >
                            {timeAgo(comment.createdAt)}
                        </span>
                    </div>
                    <div ref={menuRef} className="relative shrink-0">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Comment options"
                            className="text-ink-350 hover:text-brand p-1.5 hover:bg-brand/10 rounded-full transition-colors"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-surface-850 border border-white/5 rounded-xl shadow-2xl z-20 overflow-hidden">
                                {comment.userId === currentUser?.id ? (
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onDelete(comment);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-white/5 flex items-center space-x-3 font-bold"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete {isReply ? "reply" : "comment"}</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled={comment.isReported}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onReport(comment);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center space-x-3 font-bold ${comment.isReported ? "text-gray-500 cursor-default" : "text-white hover:bg-white/5"}`}
                                    >
                                        <Flag size={16} />
                                        <span>{comment.isReported ? "Reported" : "Report"}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <RichText
                    text={comment.comment}
                    mentions={comment.mentions}
                    currentUserId={currentUser?.id}
                    className="text-ink-100 text-[14px] leading-relaxed"
                />
                <button
                    onClick={() => onReply(comment)}
                    className="flex items-center gap-1.5 -ml-1.5 mt-1 px-1.5 py-1 rounded-full text-[12px] font-bold text-ink-350 hover:text-brand hover:bg-brand/10 transition-colors"
                >
                    <MessageCircle size={14} /> Reply
                </button>
            </div>
        </div>
    );
};

/**
 * One top-level comment with its replies. Replying to a reply posts into the
 * same thread (the server attaches it to the top-level comment) and pre-fills
 * an @mention of the person being answered.
 */
export default function CommentThread({
    comment,
    currentUser,
    onSubmitReply,
    onDelete,
    onReport,
    onProfileEnter,
    onProfileLeave,
}) {
    const [expanded, setExpanded] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [text, setText] = useState("");
    const [mentionIds, setMentionIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);
    const replies = comment.replies || [];

    const startReply = (target) => {
        setReplyTo(target);
        setExpanded(true);
        const isSelf = target.userId === currentUser?.id;
        setText(isSelf ? "" : `@${target.handle} `);
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        try {
            const replyMentionIds =
                replyTo && replyTo.userId !== currentUser?.id ? [...mentionIds, replyTo.userId] : mentionIds;
            await onSubmitReply(replyTo || comment, text.trim(), replyMentionIds);
            setText("");
            setReplyTo(null);
        } finally {
            setSubmitting(false);
        }
    };

    const rowProps = { currentUser, onReply: startReply, onDelete, onReport, onProfileEnter, onProfileLeave };

    return (
        <div className="p-4 hover:bg-white/[0.02] transition-colors">
            <CommentRow comment={comment} {...rowProps} />

            {(replies.length > 0 || replyTo) && (
                <div className="ml-[52px] mt-2 space-y-3">
                    {replies.length > 0 && (
                        <button
                            onClick={() => setExpanded((x) => !x)}
                            className="text-[12px] font-bold text-brand-light hover:underline"
                        >
                            {expanded
                                ? "Hide replies"
                                : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                        </button>
                    )}
                    {expanded &&
                        replies.map((reply) => <CommentRow key={reply.id} comment={reply} isReply {...rowProps} />)}

                    {replyTo && (
                        <form onSubmit={submit} className="flex items-start gap-2">
                            <img
                                loading="lazy"
                                decoding="async"
                                src={currentUser?.imageUrl || DEFAULT_AVATAR}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <MentionTextarea
                                    ref={inputRef}
                                    multiline={false}
                                    value={text}
                                    onChange={setText}
                                    onMentionIdsChange={setMentionIds}
                                    maxLength={1000}
                                    placeholder={`Reply to ${replyTo.username}`}
                                    aria-label={`Reply to ${replyTo.username}`}
                                    onKeyDown={(e) => e.key === "Escape" && setReplyTo(null)}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-[14px] text-white placeholder-ink-350 focus:outline-none focus:border-brand/50"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setReplyTo(null)}
                                        className="px-3 py-1 rounded-full text-[12px] font-bold text-ink-350 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!text.trim() || submitting}
                                        className="flex items-center gap-1.5 px-4 py-1 bg-brand text-white rounded-full font-bold text-[12px] disabled:opacity-50"
                                    >
                                        {submitting && <Loader2 size={12} className="animate-spin" />} Reply
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, MoreHorizontal, Trash2, Flag, Loader2 } from "lucide-react";
import RichText from "./RichText";
import MentionTextarea from "./MentionTextarea";
import { timeAgo } from "../../utils/timeAgo";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { DURATION, EASE_SOFT } from "../common/motionPresets";
import { DROP_IN, FOCUS_RING, MENU, MENU_ITEM, PRESS, SOFT_TRANSITION } from "./postUi";

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
                className={`shrink-0 rounded-full self-start ${FOCUS_RING}`}
            >
                <img
                    loading="lazy"
                    decoding="async"
                    src={comment.avatar || DEFAULT_AVATAR}
                    alt={comment.username || "Anonymous"}
                    className={`${avatarSize} rounded-full object-cover bg-surface-600`}
                />
            </Link>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                        <Link
                            to={profilePath}
                            onMouseEnter={(e) => onProfileEnter(e, comment.userId)}
                            onMouseLeave={onProfileLeave}
                            className={`font-bold text-[14px] text-white hover:text-brand-light rounded-sm truncate ${SOFT_TRANSITION} ${FOCUS_RING}`}
                        >
                            {comment.username || "Anonymous"}
                        </Link>
                        <span className="text-ink-300 text-[13px] truncate">@{comment.handle}</span>
                        <span className="text-ink-500 text-[13px]" aria-hidden="true">
                            ·
                        </span>
                        <span
                            className="text-ink-300 text-[13px] shrink-0"
                            title={new Date(comment.createdAt).toLocaleString()}
                        >
                            {timeAgo(comment.createdAt)}
                        </span>
                    </div>
                    <div ref={menuRef} className="relative shrink-0">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Comment options"
                            className={`text-ink-300 hover:text-brand-light p-1.5 hover:bg-brand/10 rounded-full ${SOFT_TRANSITION} ${FOCUS_RING}`}
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {menuOpen && (
                            <div className={`${MENU} absolute right-0 mt-1 w-48 origin-top-right ${DROP_IN}`}>
                                {comment.userId === currentUser?.id ? (
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onDelete(comment);
                                        }}
                                        className={`${MENU_ITEM} text-red-400 hover:bg-red-500/10`}
                                    >
                                        <Trash2 size={15} />
                                        <span>Delete {isReply ? "reply" : "comment"}</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled={comment.isReported}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onReport(comment);
                                        }}
                                        className={`${MENU_ITEM} ${comment.isReported ? "text-ink-400 cursor-default" : "text-white hover:bg-white/[0.06]"}`}
                                    >
                                        <Flag size={15} />
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
                    className="text-ink-100 text-[14px] leading-[1.65]"
                />
                <button
                    onClick={() => onReply(comment)}
                    className={`flex items-center gap-1.5 -ml-1.5 mt-1 px-2 py-1 rounded-full text-[12px] font-bold text-ink-300 hover:text-brand-light hover:bg-brand/10 ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
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
    const reduceMotion = useReducedMotion();
    const replies = comment.replies || [];
    // Replies and the reply box open and close by height, so the rows below glide instead of jumping.
    // Clipped only while moving ("clip", unlike "hidden", can't be scrolled by focusing the reply box), then
    // visible again so the comment menus and the @mention list can overflow.
    const collapse = {
        initial: { height: 0, opacity: 0, overflow: "clip" },
        animate: { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } },
        exit: { height: 0, opacity: 0, overflow: "clip" },
        transition: { duration: reduceMotion ? 0 : DURATION.panel, ease: EASE_SOFT },
    };

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
        <div className="px-4 py-4 hover:bg-white/[0.02] transition-colors duration-200 ease-soft">
            <CommentRow comment={comment} {...rowProps} />

            {(replies.length > 0 || replyTo) && (
                <div className="ml-[52px] mt-2">
                    {replies.length > 0 && (
                        <button
                            onClick={() => setExpanded((x) => !x)}
                            aria-expanded={expanded}
                            className={`text-[12px] font-bold text-brand-light hover:text-ink-100 rounded-sm ${SOFT_TRANSITION} ${FOCUS_RING}`}
                        >
                            {expanded
                                ? "Hide replies"
                                : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                        </button>
                    )}
                    <AnimatePresence initial={false}>
                        {expanded && replies.length > 0 && (
                            <motion.div key="replies" {...collapse}>
                                <div className="space-y-3 pt-3">
                                    {replies.map((reply) => (
                                        <CommentRow key={reply.id} comment={reply} isReply {...rowProps} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                        {replyTo && (
                            <motion.div key="reply-form" {...collapse}>
                                <form onSubmit={submit} className="flex items-start gap-2 pt-3">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src={currentUser?.imageUrl || DEFAULT_AVATAR}
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover shrink-0 bg-surface-600"
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
                                            className="w-full bg-white/[0.04] border border-line rounded-full px-4 py-2 text-[14px] text-white placeholder-ink-400 focus:outline-none focus:border-brand-light/40 focus:ring-2 focus:ring-brand-light/10 transition duration-200 ease-soft"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setReplyTo(null)}
                                                className={`px-3 py-1 rounded-full text-[12px] font-bold text-ink-300 hover:text-white hover:bg-white/[0.06] ${SOFT_TRANSITION} ${FOCUS_RING}`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!text.trim() || submitting}
                                                className={`flex items-center gap-1.5 px-4 py-1 bg-brand hover:bg-brand/85 text-white rounded-full font-bold text-[12px] disabled:opacity-50 disabled:pointer-events-none ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                                            >
                                                {submitting && <Loader2 size={12} className="animate-spin" />} Reply
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

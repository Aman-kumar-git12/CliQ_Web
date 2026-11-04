import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, CheckCheck, X, AtSign, Reply, Repeat2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { timeAgo } from "../utils/timeAgo";
import { DEFAULT_AVATAR } from "../utils/avatar";
import NotificationsShimmering from "../components/shimmering/NotificationsShimmering";

const TYPE_META = {
    like: { icon: Heart, tint: "text-pink-400 bg-pink-500/15", text: () => "liked your post" },
    comment: {
        icon: MessageCircle,
        tint: "text-sky-400 bg-sky-500/15",
        text: (n) => (n.comment?.comment ? `commented: “${n.comment.comment}”` : "commented on your post"),
    },
    connection_request: {
        icon: UserPlus,
        tint: "text-brand-light bg-brand/15",
        text: () => "wants to connect with you",
    },
    connection_accepted: {
        icon: UserCheck,
        tint: "text-emerald-400 bg-emerald-500/15",
        text: () => "accepted your connection request",
    },
    mention: {
        icon: AtSign,
        tint: "text-fuchsia-400 bg-fuchsia-500/15",
        text: (n) => (n.comment?.comment ? `mentioned you: “${n.comment.comment}”` : "mentioned you in a post"),
    },
    reply: {
        icon: Reply,
        tint: "text-sky-400 bg-sky-500/15",
        text: (n) => (n.comment?.comment ? `replied: “${n.comment.comment}”` : "replied to your comment"),
    },
    repost: { icon: Repeat2, tint: "text-emerald-400 bg-emerald-500/15", text: () => "reposted your post" },
};
const POST_TYPES = ["like", "comment", "mention", "reply", "repost"];

const getTargetPath = (n) => {
    if (POST_TYPES.includes(n.type) && n.postId) return `/post/${n.postId}${n.commentId ? "?comment=true" : ""}`;
    if (n.type === "connection_request") return "/requests";
    return `/public-profile/${n.actorId}`;
};

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, hasMore, loadMore, markRead, markAllRead, removeNotification } =
        useNotifications();
    const navigate = useNavigate();

    const handleOpen = (n) => {
        markRead(n.id);
        navigate(getTargetPath(n));
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10">
                <div className="flex items-end justify-between mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Bell size={14} className="text-brand" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-pink">
                                Activity
                            </span>
                        </div>
                        <h1 className="text-[28px] md:text-[32px] font-black tracking-tighter uppercase italic leading-none">
                            Notifications
                        </h1>
                        <p className="text-[12px] text-ink-450 font-bold mt-2">
                            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-line hover:bg-white/10 hover:border-line-strong active:scale-[0.97] text-[11px] font-black uppercase tracking-[0.15em] cliq-transition focus-ring"
                        >
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2.5">
                    <AnimatePresence initial={false}>
                        {notifications.map((n) => {
                            const meta = TYPE_META[n.type] || TYPE_META.like;
                            const Icon = meta.icon;
                            const actorName = n.actor ? `${n.actor.firstname} ${n.actor.lastname}` : "Someone";
                            return (
                                <motion.div
                                    key={n.id}
                                    layout="position"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 24, transition: { duration: 0.18, ease: "easeOut" } }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    className={`group relative flex items-center gap-3.5 p-3.5 md:p-4 rounded-[18px] border cursor-pointer transition-colors duration-150 ease-soft focus-ring
                                    ${n.isRead ? "bg-surface-800 border-white/5 hover:bg-white/[0.03] hover:border-line" : "bg-gradient-to-r from-brand/10 to-brand-pink/5 border-brand/25 hover:from-brand/15 hover:border-brand/35"}`}
                                    onClick={() => handleOpen(n)}
                                    // Holds the dismiss button, so it can't be a <button> itself
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.target !== e.currentTarget) return;
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleOpen(n);
                                        }
                                    }}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            loading="lazy"
                                            decoding="async"
                                            src={n.actor?.imageUrl || DEFAULT_AVATAR}
                                            alt={actorName}
                                            className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] object-cover border border-line"
                                        />
                                        <span
                                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface-800 ${meta.tint}`}
                                        >
                                            <Icon size={12} strokeWidth={2.75} />
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] md:text-[14px] leading-snug line-clamp-2">
                                            <span className="font-black">{actorName}</span>{" "}
                                            <span className="text-white/75">{meta.text(n)}</span>
                                        </p>
                                        {n.post?.content && POST_TYPES.includes(n.type) && (
                                            <p className="text-[11px] text-ink-450 truncate mt-1">“{n.post.content}”</p>
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-550 mt-1 block">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    {n.post?.image && (
                                        <img
                                            loading="lazy"
                                            decoding="async"
                                            src={n.post.image}
                                            alt=""
                                            className="hidden sm:block w-12 h-12 rounded-xl object-cover border border-line shrink-0"
                                        />
                                    )}
                                    {!n.isRead && (
                                        <span
                                            className="w-2.5 h-2.5 rounded-full bg-brand-pink shadow-md shadow-brand-pink/60 shrink-0"
                                            role="img"
                                            aria-label="Unread"
                                        />
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(n.id);
                                        }}
                                        aria-label="Dismiss notification"
                                        type="button"
                                        className="opacity-100 md:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-ink-450 hover:text-white hover:bg-white/10 active:scale-95 cliq-transition focus-ring"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {!loading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-20 rounded-[22px] border border-dashed border-line bg-surface-800 animate-fadeIn">
                            <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                                <Bell size={26} className="text-brand" />
                            </div>
                            <p className="font-black text-[15px]">No notifications yet</p>
                            <p className="text-[12px] text-ink-450 mt-1 max-w-xs">
                                Likes, comments and connection requests will show up here.
                            </p>
                        </div>
                    )}

                    {/* First load: a page of rows; loading more: a couple below the list */}
                    {loading && (
                        <NotificationsShimmering
                            withHeader={false}
                            rows={notifications.length ? 2 : 6}
                            label={notifications.length ? "Loading more notifications" : "Loading notifications"}
                        />
                    )}

                    {hasMore && !loading && (
                        <button
                            onClick={loadMore}
                            className="mx-auto mt-2 px-6 py-2.5 rounded-xl bg-white/5 border border-line hover:bg-white/10 hover:border-line-strong cliq-press text-[11px] font-black uppercase tracking-[0.15em] focus-ring"
                        >
                            Load more
                        </button>
                    )}
                </div>
            </div>
        </MotionConfig>
    );
}

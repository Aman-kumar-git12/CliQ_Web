import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, MessageSquare, Users as Play } from "lucide-react";
import { Link } from "react-router-dom";
import * as connectionsApi from "../../api/connections";
import * as usersApi from "../../api/users";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { cachedRequest, invalidateCachedRequests } from "../../utils/requestCache";

// Hovering the same person again within this time reuses the card instead of loading it again
const HOVER_CARD_MAX_AGE_MS = 30000;

const ProfileHoverCard = ({ userId, isVisible, anchorRect, onMouseEnter, onMouseLeave }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("none");

    useEffect(() => {
        if (!isVisible || !userId) return;
        let cancelled = false; // a late response for a closed card or another userId is ignored

        const fetchData = async () => {
            setLoading(true);
            try {
                const card = await cachedRequest(
                    `hover-card:${userId}`,
                    () => usersApi.getHoverCard(userId, { silent: true }),
                    HOVER_CARD_MAX_AGE_MS,
                );
                if (cancelled) return;
                setData(card);
                setConnectionStatus(card.connectionStatus);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching hover card data:", err);
                setError("Failed to load profile");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => {
            cancelled = true;
        };
    }, [isVisible, userId]);

    // "interested" alone can't say who asked; the server adds requestDirection for that
    const isIncomingRequest = connectionStatus === "interested" && data?.requestDirection === "incoming";

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (connectionStatus !== "none" && connectionStatus !== "ignored") return;

        try {
            await connectionsApi.sendConnectionRequest(userId);
            setConnectionStatus("interested");
            invalidateCachedRequests(`hover-card:${userId}`);
        } catch (error) {
            console.error("Follow failed:", error);
        }
    };

    if (!anchorRect) return null;

    // Robust Viewport Logic
    const estHeight = 520; // Estimated max height of profile card
    const spaceBelow = window.innerHeight - anchorRect.viewportTop - anchorRect.height;
    const spaceAbove = anchorRect.viewportTop;

    // Choose direction based on more available space or if it fits
    const showBelow = spaceBelow > spaceAbove || spaceBelow > estHeight;

    let top = showBelow ? anchorRect.bottom + 10 : anchorRect.top - 10;
    const left = anchorRect.left + anchorRect.width / 2;

    // Clamping: Ensure card doesn't go off-screen vertically
    // If showing below, viewport bottom would be viewportTop + height + gap + cardHeight
    // If showing above, viewport top would be viewportTop - gap - cardHeight
    if (showBelow) {
        if (anchorRect.viewportTop + anchorRect.height + 10 + estHeight > window.innerHeight) {
            // If it hits bottom, we can't easily clamp without it overlapping the trigger,
            // but for absolute positioning, we just ensure it's at least not below innerHeight
        }
    } else {
        // If showing above, and it hits the top (0)
        const viewportTopPos = anchorRect.viewportTop - 10 - estHeight;
        if (viewportTopPos < 10) {
            // Push it down to 10px from top
            const diff = 10 - viewportTopPos;
            top += diff;
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: showBelow ? -10 : 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: showBelow ? -10 : 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        top: top,
                        left: left,
                        transform: `translateX(-50%) ${showBelow ? "" : "translateY(-100%)"}`,
                        zIndex: 1000,
                        pointerEvents: "auto",
                        maxHeight: "max-content",
                    }}
                    className="w-[380px] overflow-hidden"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Arrow / Tail (Top)                        {/* Arrow removed for "perfect box" look */}

                    <div className="bg-white/90 dark:bg-surface-raised/95 backdrop-blur-xl border border-neutral-200 dark:border-line-strong rounded-2xl shadow-pop overflow-hidden p-5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs text-neutral-500 dark:text-ink-300">Fetching profile...</p>
                            </div>
                        ) : error ? (
                            <div className="py-4 text-center text-red-500 text-sm">{error}</div>
                        ) : (
                            <>
                                {/* Header with Avatar and Names */}
                                <Link
                                    to={data.isMe ? "/profile" : `/public-profile/${userId}`}
                                    className="flex items-center gap-4 mb-5 rounded-xl group/header focus-ring"
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-brand-pink rounded-full blur opacity-20 group-hover/header:opacity-50 transition-opacity duration-200 ease-soft"></div>
                                        <img
                                            src={data.imageUrl || DEFAULT_AVATAR}
                                            alt={data.firstname}
                                            className="relative w-16 h-16 rounded-full object-cover border-2 border-white dark:border-surface-raised shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-black dark:text-white truncate leading-tight group-hover/header:text-brand-light transition-colors duration-150 ease-soft">
                                            {data.firstname} {data.lastname}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-ink-300 truncate">
                                            @{data.username}
                                        </p>
                                    </div>
                                </Link>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">
                                            {data.postsCount}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                                            posts
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">
                                            {data.connectionsCount}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                                            connections
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">
                                            {data.groupsCount}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                                            groups
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Posts */}
                                {data.recentPosts && data.recentPosts.length > 0 && (
                                    <div className="grid grid-cols-3 gap-1 mb-5 rounded-lg overflow-hidden border border-neutral-100 dark:border-line-soft">
                                        {data.recentPosts
                                            .concat(Array(Math.max(0, 3 - data.recentPosts.length)).fill(null))
                                            .slice(0, 3)
                                            .map((post, i) => (
                                                <div
                                                    key={post ? post.id : `empty-slot-${i}`}
                                                    className="aspect-square bg-neutral-100 dark:bg-white/[0.03] overflow-hidden"
                                                >
                                                    {post ? (
                                                        <Link
                                                            to={`/post/${post.id}`}
                                                            className="block w-full h-full focus-ring focus-visible:ring-inset"
                                                        >
                                                            {post.video ? (
                                                                <div className="relative w-full h-full">
                                                                    <video
                                                                        src={post.video}
                                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-250 ease-soft"
                                                                        muted
                                                                        playsInline
                                                                        preload="metadata"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                                                                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white pointer-events-none">
                                                                        <Play size={10} fill="currentColor" />
                                                                    </div>
                                                                </div>
                                                            ) : post.image ? (
                                                                <img
                                                                    src={post.image}
                                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-250 ease-soft"
                                                                    alt={`Post by ${[data.firstname, data.lastname].filter(Boolean).join(" ")}`}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center p-2 hover:bg-neutral-200 dark:hover:bg-white/[0.06] transition-colors duration-150 ease-soft">
                                                                    <MessageSquare
                                                                        size={12}
                                                                        className="text-neutral-400 dark:text-ink-400"
                                                                    />
                                                                </div>
                                                            )}
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* They sent you a request: answer it on the Requests page */}
                                {!data.isMe && isIncomingRequest && (
                                    <Link
                                        to="/requests"
                                        className="w-full py-2.5 rounded-xl font-bold text-sm cliq-transition flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-brand to-brand-pink text-white hover:shadow-brand/30 hover:brightness-110 active:scale-[0.98] focus-ring"
                                    >
                                        <UserPlus size={16} /> Respond to Request
                                    </Link>
                                )}

                                {/* Action Button */}
                                {!data.isMe && !isIncomingRequest && (
                                    <button
                                        onClick={handleFollow}
                                        disabled={connectionStatus === "interested" || connectionStatus === "accepted"}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm cliq-transition flex items-center justify-center gap-2 focus-ring
                                            ${
                                                connectionStatus === "accepted"
                                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 cursor-default"
                                                    : connectionStatus === "interested"
                                                      ? "bg-neutral-100 dark:bg-white/[0.06] text-neutral-500 dark:text-white/50 border border-neutral-200 dark:border-line cursor-default"
                                                      : "shadow-lg bg-gradient-to-r from-brand to-brand-pink text-white hover:shadow-brand/30 hover:brightness-110 active:scale-[0.98]"
                                            }`}
                                    >
                                        {connectionStatus === "accepted" ? (
                                            <>
                                                <Check size={16} /> Connected
                                            </>
                                        ) : connectionStatus === "interested" ? (
                                            "Request Sent"
                                        ) : (
                                            <>
                                                <UserPlus size={16} /> Connect
                                            </>
                                        )}
                                    </button>
                                )}

                                {data.isMe && (
                                    <Link
                                        to="/profile"
                                        className="block w-full py-2.5 bg-neutral-100 dark:bg-white/[0.06] text-black dark:text-white border border-transparent dark:border-line rounded-xl font-bold text-sm text-center cliq-transition hover:bg-neutral-200 dark:hover:bg-white/10 active:scale-[0.98] focus-ring"
                                    >
                                        Edit Profile
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Arrow / Tail (Bottom)                        {/* Arrow removed for "perfect box" look */}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileHoverCard;

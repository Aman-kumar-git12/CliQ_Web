import { useState, useEffect, useRef } from "react";
import { LayoutGrid, List, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import * as connectionsApi from "../../api/connections";
import FindPeopleShimmering from "../shimmering/FindPeopleShimmering";
import { useUserContext } from "../../context/UserContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProfileHoverCard from "../profile/ProfileHoverCard";
import { createPortal } from "react-dom";
import { avatarUrl } from "../../utils/avatar";
import { invalidateCachedRequests } from "../../utils/requestCache";

const layoutTransition = { type: "spring", stiffness: 350, damping: 38, mass: 0.8 };
const getPublicHandle = (user) => {
    const first = String(user?.firstname || "")
        .trim()
        .toLowerCase();
    const last = String(user?.lastname || "")
        .trim()
        .toLowerCase();
    return [first, last].filter(Boolean).join("_") || "user";
};
const isAiMatch = (user) => user.matchType && user.matchType !== "keyword";

// People as cards with a Connect button, in list or grid view. Used by Search for the
// "Suggested Network" (no query) and for people results (showMatchReasons).
// `checkStatuses={false}` skips the per-person status requests when the list can't contain anyone
// you already have a connection record with (the server leaves them out of suggestions).
export default function PeopleCards({ title, users, loading = false, showMatchReasons = false, checkStatuses = true }) {
    const { user: currentUser } = useUserContext();
    const navigate = useNavigate();
    const [snack, setSnack] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
    const [connectionStatuses, setConnectionStatuses] = useState({});

    // Profile Hover State
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverUserId, setHoverUserId] = useState(null);
    const hoverTimerRef = useRef(null);
    const snackTimerRef = useRef(null);

    // Pending hover/snackbar timers must not fire after the list unmounts
    useEffect(
        () => () => {
            clearTimeout(hoverTimerRef.current);
            clearTimeout(snackTimerRef.current);
        },
        [],
    );

    const handleProfileMouseEnter = (e, userId) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        const target = e.currentTarget;
        hoverTimerRef.current = setTimeout(() => {
            setHoverUserId(userId);
            setHoverAnchorRect(target.getBoundingClientRect());
            setShowHoverCard(true);
        }, 500);
    };

    const handleProfileMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setShowHoverCard(false);
    };

    const showSnack = (msg) => {
        setSnack(msg);
        clearTimeout(snackTimerRef.current);
        snackTimerRef.current = setTimeout(() => setSnack(""), 2000);
    };

    useEffect(() => {
        if (!checkStatuses) return undefined;
        const others = users.filter((user) => user.id !== currentUser?.id);
        if (others.length === 0) return undefined;
        // When the people list changes, statuses still loading for the old list are dropped
        const controller = new AbortController();

        const fetchStatuses = async () => {
            const statuses = {};
            await Promise.all(
                others.map(async (user) => {
                    try {
                        const data = await connectionsApi.getConnectionStatus(user.id, { signal: controller.signal });
                        const status = data.status || data.connection?.status;
                        // A request this person sent me is "incoming" (answer it), not "Requested"
                        const incoming = status === "interested" && data.connection?.fromUserId !== currentUser?.id;
                        statuses[user.id] = {
                            status: status === "accepted" ? "connected" : incoming ? "incoming" : status || "none",
                        };
                    } catch {
                        statuses[user.id] = { status: "none" };
                    }
                }),
            );
            if (controller.signal.aborted) return;
            setConnectionStatuses((prev) => ({ ...prev, ...statuses }));
        };
        fetchStatuses();
        return () => controller.abort();
    }, [users, currentUser?.id, checkStatuses]);

    const handleConnect = async (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "incoming") {
            navigate("/requests");
            return;
        }
        if (status === "connected" || status === "interested") return;
        try {
            await connectionsApi.sendConnectionRequest(userId, "interested", undefined, { silent: true });
            setConnectionStatuses((prev) => ({ ...prev, [userId]: { status: "interested" } }));
            invalidateCachedRequests("suggested-users");
            invalidateCachedRequests(`hover-card:${userId}`);
            showSnack("Request sent");
        } catch (error) {
            console.error("Connect failed:", error);
            showSnack(error.response?.data?.message || "Failed to send request");
        }
    };

    const buttonText = (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "connected") return "Connected";
        if (status === "interested") return "Requested";
        if (status === "incoming") return "Respond";
        return "Connect";
    };

    const buttonClass = (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "connected") return "bg-white/5 text-ink-300 border-white/10";
        if (status === "interested") return "bg-surface-700 text-ink-500 border-surface-600";
        return "bg-indigo-200 text-[#1e1b4b] border-transparent hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(199,210,254,0.4)] shadow-[0_0_15px_rgba(199,210,254,0.2)]";
    };

    const isDisabled = (userId) => ["connected", "interested"].includes(connectionStatuses[userId]?.status);
    const profileLink = (user) => (currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`);

    return (
        <section className="space-y-5 relative z-10 w-full">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-[11px] font-black text-ink-450 uppercase tracking-[0.4em] whitespace-nowrap">
                    {title}
                </h2>

                <div className="flex p-0.5 bg-surface-700 rounded-[14px] border border-white/5 items-center">
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        aria-pressed={viewMode === "list"}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-lg" : "text-ink-600 hover:text-ink-300"}`}
                    >
                        <List size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        aria-pressed={viewMode === "grid"}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-lg" : "text-ink-600 hover:text-ink-300"}`}
                    >
                        <LayoutGrid size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <LayoutGroup id="people-cards">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        layout
                        key={viewMode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={layoutTransition}
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full"
                                : "flex flex-col gap-3 md:gap-4 w-full"
                        }
                    >
                        {loading ? (
                            <FindPeopleShimmering viewMode={viewMode} />
                        ) : (
                            users.map((user) => (
                                <motion.div
                                    layout
                                    key={user.id}
                                    layoutId={`card-container-${user.id}`}
                                    whileHover={{ y: -5 }}
                                    transition={layoutTransition}
                                    className="group relative h-full"
                                >
                                    <motion.div
                                        layoutId={`card-glow-${user.id}`}
                                        className="absolute -inset-0.5 bg-gradient-to-br from-brand/20 to-brand-pink/20 rounded-[28px] blur-[15px] opacity-0 group-hover:opacity-100 transition duration-500"
                                    />

                                    {viewMode === "grid" ? (
                                        <motion.div
                                            layout
                                            layoutId={`card-inner-${user.id}`}
                                            className="relative h-full flex flex-col items-center text-center p-3 md:p-4 rounded-[20px] border border-white/5 bg-surface-800 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden"
                                        >
                                            <motion.div
                                                layoutId={`avatar-box-${user.id}`}
                                                onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                                onMouseLeave={handleProfileMouseLeave}
                                                className="relative mb-3 md:mb-4 shrink-0"
                                            >
                                                <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-full overflow-hidden border-2 border-surface-700 group-hover:border-brand/50 transition-colors duration-500 p-0.5 shadow-2xl bg-gradient-to-br from-brand/20 to-brand-pink/20">
                                                    <img
                                                        loading="lazy"
                                                        decoding="async"
                                                        src={avatarUrl(user.imageUrl)}
                                                        alt={
                                                            `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
                                                            "User"
                                                        }
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0 w-full mb-4 md:mb-5">
                                                <motion.div layoutId={`name-${user.id}`}>
                                                    <Link
                                                        to={profileLink(user)}
                                                        className="block font-black text-[12px] md:text-[14px] text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand group-hover:to-brand-pink transition-all no-underline tracking-tighter uppercase italic"
                                                    >
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                </motion.div>
                                                <motion.span
                                                    layoutId={`handle-${user.id}`}
                                                    className="block text-[9px] md:text-[10px] text-ink-500 font-bold uppercase tracking-widest mt-0.5 truncate px-2"
                                                >
                                                    @{user.username || getPublicHandle(user)}
                                                </motion.span>
                                                {showMatchReasons && isAiMatch(user) && (
                                                    <span
                                                        className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[9px] font-black uppercase tracking-wider"
                                                        title="Matched by meaning, not just keywords"
                                                    >
                                                        <Sparkles size={10} /> AI match
                                                    </span>
                                                )}
                                            </div>
                                            {currentUser?.id !== user.id && (
                                                <motion.button
                                                    layoutId={`btn-${user.id}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleConnect(user.id)}
                                                    disabled={isDisabled(user.id)}
                                                    className={`w-full py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${buttonClass(user.id)}`}
                                                >
                                                    {buttonText(user.id)}
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            layout
                                            layoutId={`card-inner-${user.id}`}
                                            className="relative flex flex-row items-center gap-3.5 md:gap-5 p-3 md:p-[18px] rounded-[20px] md:rounded-[22px] border border-white/5 bg-surface-800 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-xl group/card overflow-hidden"
                                        >
                                            <motion.div
                                                layoutId={`avatar-box-${user.id}`}
                                                onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                                onMouseLeave={handleProfileMouseLeave}
                                                className="relative shrink-0 flex items-center"
                                            >
                                                <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-[14px] md:rounded-[18px] overflow-hidden border border-surface-700 group-hover/card:border-brand/50 transition-all duration-500 shadow-2xl p-[2px] bg-gradient-to-br from-brand/20 to-brand-pink/20">
                                                    <img
                                                        loading="lazy"
                                                        decoding="async"
                                                        src={avatarUrl(user.imageUrl)}
                                                        alt={
                                                            `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
                                                            "User"
                                                        }
                                                        className="w-full h-full object-cover rounded-[11px] md:rounded-[14px]"
                                                    />
                                                </div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                                                <motion.div
                                                    layoutId={`name-${user.id}`}
                                                    className="flex items-center gap-2 min-w-0"
                                                >
                                                    <Link
                                                        to={profileLink(user)}
                                                        className="inline-block font-black text-[15px] md:text-[20px] text-white truncate group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-brand group-hover/card:to-brand-pink transition-all no-underline tracking-tighter uppercase italic leading-none"
                                                    >
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                    {showMatchReasons && isAiMatch(user) && (
                                                        <span
                                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[9px] font-black uppercase tracking-wider shrink-0"
                                                            title="Matched by meaning, not just keywords"
                                                        >
                                                            <Sparkles size={10} /> AI match
                                                        </span>
                                                    )}
                                                </motion.div>
                                                <div className="flex items-center gap-3 mt-1 underline decoration-white/5 underline-offset-4">
                                                    <motion.span
                                                        layoutId={`handle-${user.id}`}
                                                        className="text-[9px] md:text-[11.5px] text-ink-500 font-bold uppercase tracking-[0.15em]"
                                                    >
                                                        @{user.username || getPublicHandle(user)}
                                                    </motion.span>
                                                    <span className="w-1 h-1 rounded-full bg-surface-600"></span>
                                                    <motion.p
                                                        layoutId={`expertise-${user.id}`}
                                                        className="text-[9px] md:text-[11.5px] text-ink-600 font-medium italic line-clamp-1 truncate max-w-[120px] xs:max-w-xs"
                                                    >
                                                        {showMatchReasons && user.matchedOn?.length
                                                            ? user.matchedOn.join(" · ")
                                                            : user.expertise?.aboutYou ||
                                                              "Potential high-tier connector discovered."}
                                                    </motion.p>
                                                </div>
                                            </div>
                                            <div className="flex items-center shrink-0">
                                                {currentUser?.id !== user.id && (
                                                    <motion.button
                                                        layoutId={`btn-${user.id}`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleConnect(user.id)}
                                                        disabled={isDisabled(user.id)}
                                                        className={`px-4 md:px-8 py-2 md:py-3 rounded-[10px] md:rounded-[12px] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${buttonClass(user.id)}`}
                                                    >
                                                        {buttonText(user.id)}
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </LayoutGroup>

            <ProfileHoverCard
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                userId={hoverUserId}
                onMouseEnter={() => setShowHoverCard(true)}
                onMouseLeave={handleProfileMouseLeave}
            />

            {createPortal(
                <AnimatePresence>
                    {snack && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
                            className="fixed bottom-12 left-1/2 z-[100] px-12 py-6 bg-white text-black text-[11px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20"
                        >
                            {snack}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </section>
    );
}

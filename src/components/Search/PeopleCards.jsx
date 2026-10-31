import { useState, useEffect, useRef } from "react";
import { LayoutGrid, List, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import FindPeopleShimmering from "../shimmering/FindPeopleShimmering";
import { useUserContext } from "../../context/userContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProfileHoverCard from "../Post/ProfileHoverCard";
import { createPortal } from "react-dom";

const layoutTransition = { type: "spring", stiffness: 350, damping: 38, mass: 0.8 };
const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
const getPublicHandle = (user) => {
    const first = String(user?.firstname || "").trim().toLowerCase();
    const last = String(user?.lastname || "").trim().toLowerCase();
    return [first, last].filter(Boolean).join("_") || "user";
};
const isAiMatch = (user) => user.matchType && user.matchType !== "keyword";

// People as cards with a Connect button, in list or grid view. Used by Search for the
// "Suggested Network" (no query) and for people results (showMatchReasons).
export default function PeopleCards({ title, users, loading = false, showMatchReasons = false }) {
    const { user: currentUser } = useUserContext();
    const [snack, setSnack] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
    const [connectionStatuses, setConnectionStatuses] = useState({});

    // Profile Hover State
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverUserId, setHoverUserId] = useState(null);
    const hoverTimerRef = useRef(null);

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
        setTimeout(() => setSnack(""), 2000);
    };

    useEffect(() => {
        const others = users.filter((user) => user.id !== currentUser?.id);
        if (others.length === 0) return;

        const fetchStatuses = async () => {
            const statuses = {};
            await Promise.all(others.map(async (user) => {
                try {
                    const res = await axiosClient.get(`/user/connections/${user.id}`);
                    const status = res.data.status || res.data.connection?.status;
                    statuses[user.id] = { status: status === "accepted" ? "connected" : status || "none" };
                } catch {
                    statuses[user.id] = { status: "none" };
                }
            }));
            setConnectionStatuses(prev => ({ ...prev, ...statuses }));
        };
        fetchStatuses();
    }, [users, currentUser?.id]);

    const handleConnect = async (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "connected" || status === "interested") return;
        try {
            await axiosClient.post(`/request/send/interested/${userId}`);
            setConnectionStatuses(prev => ({ ...prev, [userId]: { status: "interested" } }));
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
        return "Connect";
    };

    const buttonClass = (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "connected") return "bg-white/5 text-[#8f89a7] border-white/10";
        if (status === "interested") return "bg-[#110f18] text-[#5f5a78] border-[#1c1a24]";
        return "bg-indigo-200 text-[#1e1b4b] border-transparent hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(199,210,254,0.4)] shadow-[0_0_15px_rgba(199,210,254,0.2)]";
    };

    const isDisabled = (userId) => ["connected", "interested"].includes(connectionStatuses[userId]?.status);
    const profileLink = (user) => (currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`);

    return (
        <section className="space-y-5 relative z-10 w-full">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-[11px] font-black text-[#6d6a86] uppercase tracking-[0.4em] whitespace-nowrap">{title}</h2>

                <div className="flex p-0.5 bg-[#110f18] rounded-[14px] border border-white/5 items-center">
                    <button
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-lg" : "text-[#413c58] hover:text-[#8f89a7]"}`}
                    >
                        <List size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-lg" : "text-[#413c58] hover:text-[#8f89a7]"}`}
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
                        className={viewMode === "grid"
                            ? "grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full"
                            : "flex flex-col gap-3 md:gap-4 w-full"
                        }
                    >
                        {loading ? (
                            <FindPeopleShimmering viewMode={viewMode} />
                        ) : users.map((user) => (
                            <motion.div
                                layout
                                key={user.id}
                                layoutId={`card-container-${user.id}`}
                                whileHover={{ y: -5 }}
                                transition={layoutTransition}
                                className="group relative h-full"
                            >
                                <motion.div layoutId={`card-glow-${user.id}`} className="absolute -inset-0.5 bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20 rounded-[28px] blur-[15px] opacity-0 group-hover:opacity-100 transition duration-500" />

                                {viewMode === "grid" ? (
                                    <motion.div
                                        layout
                                        layoutId={`card-inner-${user.id}`}
                                        className="relative h-full flex flex-col items-center text-center p-3 md:p-4 rounded-[20px] border border-white/5 bg-[#0e0d14] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden"
                                    >
                                        <motion.div layoutId={`avatar-box-${user.id}`} onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)} onMouseLeave={handleProfileMouseLeave} className="relative mb-3 md:mb-4 shrink-0">
                                            <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-full overflow-hidden border-2 border-[#110f18] group-hover:border-[#8b5cf6]/50 transition-colors duration-500 p-0.5 shadow-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20">
                                                <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                        </motion.div>
                                        <div className="flex-1 min-w-0 w-full mb-4 md:mb-5">
                                            <motion.div layoutId={`name-${user.id}`}>
                                                <Link to={profileLink(user)} className="block font-black text-[12px] md:text-[14px] text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#8b5cf6] group-hover:to-[#ec4899] transition-all no-underline tracking-tighter uppercase italic">
                                                    {user.firstname} {user.lastname}
                                                </Link>
                                            </motion.div>
                                            <motion.span layoutId={`handle-${user.id}`} className="block text-[9px] md:text-[10px] text-[#5f5a78] font-bold uppercase tracking-widest mt-0.5 truncate px-2">
                                                @{user.username || getPublicHandle(user)}
                                            </motion.span>
                                            {showMatchReasons && isAiMatch(user) && (
                                                <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[9px] font-black uppercase tracking-wider" title="Matched by meaning, not just keywords">
                                                    <Sparkles size={10} /> AI match
                                                </span>
                                            )}
                                        </div>
                                        {currentUser?.id !== user.id && (
                                            <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConnect(user.id)} disabled={isDisabled(user.id)} className={`w-full py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${buttonClass(user.id)}`}>{buttonText(user.id)}</motion.button>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        layout
                                        layoutId={`card-inner-${user.id}`}
                                        className="relative flex flex-row items-center gap-3.5 md:gap-5 p-3 md:p-[18px] rounded-[20px] md:rounded-[22px] border border-white/5 bg-[#0e0d14] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-xl group/card overflow-hidden"
                                    >
                                        <motion.div layoutId={`avatar-box-${user.id}`} onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)} onMouseLeave={handleProfileMouseLeave} className="relative shrink-0 flex items-center">
                                            <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-[14px] md:rounded-[18px] overflow-hidden border border-[#110f18] group-hover/card:border-[#8b5cf6]/50 transition-all duration-500 shadow-2xl p-[2px] bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20">
                                                <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover rounded-[11px] md:rounded-[14px]" />
                                            </div>
                                        </motion.div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                                            <motion.div layoutId={`name-${user.id}`} className="flex items-center gap-2 min-w-0">
                                                <Link to={profileLink(user)} className="inline-block font-black text-[15px] md:text-[20px] text-white truncate group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-[#8b5cf6] group-hover/card:to-[#ec4899] transition-all no-underline tracking-tighter uppercase italic leading-none">
                                                    {user.firstname} {user.lastname}
                                                </Link>
                                                {showMatchReasons && isAiMatch(user) && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 text-[9px] font-black uppercase tracking-wider shrink-0" title="Matched by meaning, not just keywords">
                                                        <Sparkles size={10} /> AI match
                                                    </span>
                                                )}
                                            </motion.div>
                                            <div className="flex items-center gap-3 mt-1 underline decoration-white/5 underline-offset-4">
                                                <motion.span layoutId={`handle-${user.id}`} className="text-[9px] md:text-[11.5px] text-[#5f5a78] font-bold uppercase tracking-[0.15em]">@{user.username || getPublicHandle(user)}</motion.span>
                                                <span className="w-1 h-1 rounded-full bg-[#1c1a24]"></span>
                                                <motion.p layoutId={`expertise-${user.id}`} className="text-[9px] md:text-[11.5px] text-[#413c58] font-medium italic line-clamp-1 truncate max-w-[120px] xs:max-w-xs">
                                                    {showMatchReasons && user.matchedOn?.length ? user.matchedOn.join(" · ") : (user.expertise?.aboutYou || "Potential high-tier connector discovered.")}
                                                </motion.p>
                                            </div>
                                        </div>
                                        <div className="flex items-center shrink-0">
                                            {currentUser?.id !== user.id && (
                                                <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleConnect(user.id)} disabled={isDisabled(user.id)} className={`px-4 md:px-8 py-2 md:py-3 rounded-[10px] md:rounded-[12px] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${buttonClass(user.id)}`}>{buttonText(user.id)}</motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </LayoutGroup>

            <ProfileHoverCard isVisible={showHoverCard} anchorRect={hoverAnchorRect} userId={hoverUserId} onMouseEnter={() => setShowHoverCard(true)} onMouseLeave={handleProfileMouseLeave} />

            {createPortal(
                <AnimatePresence>
                    {snack && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, x: "-50%" }} animate={{ opacity: 1, scale: 1, x: "-50%" }} exit={{ opacity: 0, scale: 0.9, x: "-50%" }} className="fixed bottom-12 left-1/2 z-[100] px-12 py-6 bg-white text-black text-[11px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20">
                            {snack}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}

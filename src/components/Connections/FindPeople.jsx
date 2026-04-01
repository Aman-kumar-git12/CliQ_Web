import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, UserCheck, Users, Sparkles, LayoutGrid, List, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import FindPeopleShimmering from "../shimmering/FindPeopleShimmering";
import { useUserContext } from "../../context/userContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProfileHoverCard from "../Post/ProfileHoverCard";
import { createPortal } from "react-dom";

export default function FindPeople() {
    const { user: currentUser } = useUserContext();
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [viewMode, setViewMode] = useState("list"); // "list" | "grid" (Default is now list)

    // Profile Hover State
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverUserId, setHoverUserId] = useState(null);
    const hoverTimerRef = useRef(null);
    const containerRef = useRef(null);

    const handleProfileMouseEnter = (e, userId) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        const target = e.currentTarget;
        hoverTimerRef.current = setTimeout(() => {
            const rect = target.getBoundingClientRect();
            setHoverUserId(userId);
            setHoverAnchorRect(rect);
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
        const fetchSuggestions = async () => {
            if (!search) setLoading(true);
            try {
                const res = await axiosClient.get("/user/search/suggested");
                setSuggestions(res.data);
            } catch (err) {
                console.error("Suggestion error:", err);
            } finally {
                if (!search) setLoading(false);
            }
        };
        fetchSuggestions();
    }, [refreshTrigger]);

    useEffect(() => {
        const searchUsers = async () => {
            if (!search.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await axiosClient.get(`/user/search/${search}`);
                setResults(res.data);
            } catch (err) {
                console.error("Search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(searchUsers, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
    const getPublicHandle = (user) => {
        const first = String(user?.firstname || "").trim().toLowerCase();
        const last = String(user?.lastname || "").trim().toLowerCase();
        return [first, last].filter(Boolean).join("_") || "user";
    };
    const [connectionStatuses, setConnectionStatuses] = useState({});

    useEffect(() => {
        const usersToFetch = search ? results : suggestions;
        if (usersToFetch.length === 0) return;

        const fetchStatuses = async () => {
            const statuses = {};
            await Promise.all(usersToFetch.map(async (user) => {
                try {
                    const res = await axiosClient.get(`/user/connections/${user.id}`);
                    const status = res.data.status || (res.data.connection && res.data.connection.status);
                    const senderId = res.data.sender || (res.data.connection && res.data.connection.sender);
                    if (status) {
                        statuses[user.id] = { status: status === "accepted" ? "connected" : status, sender: senderId };
                    } else {
                        statuses[user.id] = { status: "none" };
                    }
                } catch (err) {
                    if (err.response && err.response.status === 404) statuses[user.id] = { status: "none" };
                }
            }));
            setConnectionStatuses(prev => ({ ...prev, ...statuses }));
        };
        fetchStatuses();
    }, [results, suggestions, search]);

    const handleFollow = async (userId) => {
        const currentData = connectionStatuses[userId] || { status: "none" };
        if (currentData.status === "connected" || currentData.status === "interested") return;
        try {
            await axiosClient.post(`/request/send/interested/${userId}`);
            setConnectionStatuses(prev => ({ ...prev, [userId]: { status: "interested" } }));
            showSnack("Request sent");
            setRefreshTrigger(!refreshTrigger);
        } catch (error) {
            console.error("Follow failed:", error);
            showSnack("Failed to send request");
        }
    };

    const getButtonText = (userId) => {
        const status = connectionStatuses[userId]?.status;
        switch (status) {
            case "connected": return "Connected";
            case "interested": return "Requested";
            default: return "Connect";
        }
    };

    const layoutTransition = {
        type: "spring",
        stiffness: 350,
        damping: 38,
        mass: 0.8
    };

    return (
        <div ref={containerRef} className="w-full relative min-h-screen pb-24 md:pb-4 overflow-visible text-white px-4 md:px-0 md:pr-6">

            {/* Header Section: Responsive Alignment */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-5 flex flex-col items-start justify-start gap-4 md:gap-5 relative z-10 max-w-full md:max-w-2xl mx-auto w-full"
            >
                <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="fill-[#8b5cf6]/20 text-[#8b5cf6]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Discovery Module</span>
                        </div>

                         {/* View Mode Toggle - Responsive Positioning: Right of Branding Row on Mobile */}
                         <div className="md:hidden flex p-0.5 bg-[#110f18] rounded-[14px] border border-white/5 items-center">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-lg" : "text-[#413c58] hover:text-[#8f89a7]"}`}
                            >
                                <List size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-lg" : "text-[#413c58] hover:text-[#8f89a7]"}`}
                            >
                                <LayoutGrid size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between w-full gap-4 md:gap-0">
                        <div className="flex flex-col">
                            <motion.h1
                                layout
                                className="text-[28px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md"
                            >
                                Explore
                            </motion.h1>
                            <span className="text-[22px] md:text-[26px] text-[#5f5a78] font-light uppercase italic leading-none -mt-1 block">
                                Engine
                            </span>
                        </div>

                        {/* View Mode Toggle - Desktop Only Positioning */}
                        <div className="hidden md:flex p-1 bg-[#110f18] rounded-[18px] border border-white/5 relative items-center shadow-inner">
                            <motion.div
                                layoutId="toggleBg_desktop"
                                className="absolute inset-y-1 bg-[#1c1a24] border border-white/5 rounded-[15px] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                initial={false}
                                animate={{ x: viewMode === "list" ? 0 : 36, width: 36 }}
                                transition={layoutTransition}
                            />
                            <button
                                onClick={() => setViewMode("list")}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl relative z-10 transition-colors ${viewMode === "list" ? "text-white" : "text-[#413c58] hover:text-[#8f89a7]"}`}
                            >
                                <List size={16} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl relative z-10 transition-colors ${viewMode === "grid" ? "text-white" : "text-[#413c58] hover:text-[#8f89a7]"}`}
                            >
                                <LayoutGrid size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div layout className="relative group w-full max-w-full md:max-w-2xl mx-0 mt-[-4px]">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6]/20 to-[#ec4899]/20 rounded-[22px] blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                    <div className="relative flex items-center shadow-2xl">
                        <div className="absolute left-5 text-[#413c58] group-focus-within:text-[#8b5cf6] transition-colors duration-300">
                            <Search size={16} strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search experts, builders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 md:py-3 rounded-[16px] bg-[#0e0d14] border border-white/5 text-[13px] text-white font-medium placeholder-[#413c58] focus:outline-none focus:border-[#8b5cf6]/30 transition-all duration-500 shadow-inner"
                        />
                    </div>
                </motion.div>
            </motion.div>

            <div className="space-y-5 relative z-10 max-w-full md:max-w-2xl mx-auto w-full">
                <motion.div layout className="flex items-center gap-4">
                    <h2 className="text-[11px] font-black text-[#6d6a86] uppercase tracking-[0.4em] whitespace-nowrap">
                        {search ? "Telemetry Results" : "Suggested Network"}
                    </h2>
                </motion.div>

                <LayoutGroup id="discovery-grid">
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                            layout
                            key={viewMode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={layoutTransition}
                            className={viewMode === "grid"
                                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-full md:max-w-2xl mx-auto"
                                : "flex flex-col gap-3 md:gap-4 w-full max-w-full md:max-w-2xl mx-auto"
                            }
                        >
                            {loading && !search ? (
                                <FindPeopleShimmering viewMode={viewMode} />
                            ) : (search ? results : suggestions).map((user) => (
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
                                                <div className={`absolute bottom-0 right-1 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-[#0e0d14] ${user.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-[#413c58]'}`}></div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0 w-full mb-4 md:mb-5">
                                                <motion.div layoutId={`name-${user.id}`}>
                                                    <Link to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`} className="block font-black text-[12px] md:text-[14px] text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#8b5cf6] group-hover:to-[#ec4899] transition-all no-underline tracking-tighter uppercase italic">
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                </motion.div>
                                                <motion.span layoutId={`handle-${user.id}`} className="block text-[9px] md:text-[10px] text-[#5f5a78] font-bold uppercase tracking-widest mt-0.5 truncate px-2">
                                                    @{user.username || getPublicHandle(user)}
                                                </motion.span>
                                            </div>
                                            {currentUser?.id !== user.id && (
                                                <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFollow(user.id)} disabled={connectionStatuses[user.id]?.status === "connected" || connectionStatuses[user.id]?.status === "interested"} className={`w-full py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${connectionStatuses[user.id]?.status === "connected" ? "bg-white/5 text-[#8f89a7] border-white/10" : connectionStatuses[user.id]?.status === "interested" ? "bg-[#110f18] text-[#5f5a78] border-[#1c1a24]" : "bg-indigo-200 text-[#1e1b4b] border-transparent hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(199,210,254,0.4)] shadow-[0_0_15px_rgba(199,210,254,0.2)]"}`}>{getButtonText(user.id)}</motion.button>
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
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e0d14] ${user.isOnline ? 'bg-green-500' : 'bg-[#413c58]'}`}></div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                                                <motion.div layoutId={`name-${user.id}`}>
                                                    <Link to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`} className="inline-block font-black text-[15px] md:text-[20px] text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r group-hover/card:from-[#8b5cf6] group-hover/card:to-[#ec4899] transition-all no-underline tracking-tighter uppercase italic leading-none">
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                </motion.div>
                                                <div className="flex items-center gap-3 mt-1 underline decoration-white/5 underline-offset-4">
                                                    <motion.span layoutId={`handle-${user.id}`} className="text-[9px] md:text-[11.5px] text-[#5f5a78] font-bold uppercase tracking-[0.15em]">@{user.username || getPublicHandle(user)}</motion.span>
                                                    <span className="w-1 h-1 rounded-full bg-[#1c1a24]"></span>
                                                    <motion.p layoutId={`expertise-${user.id}`} className="text-[9px] md:text-[11.5px] text-[#413c58] font-medium italic line-clamp-1 truncate max-w-[120px] xs:max-w-xs">
                                                        {user.expertise?.aboutYou || "Potential high-tier connector discovered."}
                                                    </motion.p>
                                                </div>
                                            </div>
                                            <div className="flex items-center shrink-0">
                                                {currentUser?.id !== user.id && (
                                                    <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFollow(user.id)} disabled={connectionStatuses[user.id]?.status === "connected" || connectionStatuses[user.id]?.status === "interested"} className={`px-4 md:px-8 py-2 md:py-3 rounded-[10px] md:rounded-[12px] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${connectionStatuses[user.id]?.status === "connected" ? "bg-white/5 text-[#8f89a7] border-white/10" : connectionStatuses[user.id]?.status === "interested" ? "bg-[#110f18] text-[#5f5a78] border-[#1c1a24]" : "bg-indigo-200 text-[#1e1b4b] border-transparent hover:bg-indigo-300 hover:shadow-[0_0_20px_rgba(199,210,254,0.4)] shadow-[0_0_15px_rgba(199,210,254,0.2)]"}`}>{getButtonText(user.id)}</motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </LayoutGroup>
            </div>

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
        </div>
    );
}

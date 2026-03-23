import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, UserCheck, Users, Sparkles, LayoutGrid, List, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import FindPeopleShimmering from "../shimmering/FindPeopleShimmering";
import { useUserContext } from "../../context/userContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ProfileHoverCard from "../Post/ProfileHoverCard";

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
    }, [refreshTrigger, search]);

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
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(searchUsers, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
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

    if (loading && !search) return <FindPeopleShimmering viewMode={viewMode} />;

    const layoutTransition = {
        type: "spring",
        stiffness: 350,
        damping: 38,
        mass: 0.8
    };

    return (
        <div ref={containerRef} className="w-full relative min-h-screen pb-20 overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 px-1 flex flex-col gap-6"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-500/80 mb-0.5">
                            <Zap size={12} className="fill-blue-500/20" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Discovery Module</span>
                        </div>
                        <motion.h1 
                            layout
                            className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none"
                        >
                            Explore <span className="text-neutral-500 font-light not-italic">Engine</span>
                        </motion.h1>
                    </div>

                    {/* View Mode Toggle - Swapped Order (List Left, Grid Right) */}
                    <div className="flex p-1.5 bg-neutral-900/60 backdrop-blur-3xl rounded-2xl border border-white/5 relative items-center shadow-xl self-start md:self-auto">
                        <motion.div 
                            layoutId="toggleBg_final"
                            className="absolute inset-y-1.5 bg-white rounded-xl shadow-[0_5px_15px_rgba(255,255,255,0.1)]"
                            initial={false}
                            animate={{ x: viewMode === "list" ? 0 : 48, width: 44 }}
                            transition={layoutTransition}
                        />
                        <button 
                            onClick={() => setViewMode("list")}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl relative z-10 transition-colors ${viewMode === "list" ? "text-black" : "text-neutral-500 hover:text-neutral-300"}`}
                        >
                            <List size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={() => setViewMode("grid")}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl relative z-10 transition-colors ${viewMode === "grid" ? "text-black" : "text-neutral-500 hover:text-neutral-300"}`}
                        >
                            <LayoutGrid size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <motion.div layout className="relative group w-full max-w-3xl mx-auto md:mx-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[22px] blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                    <div className="relative flex items-center">
                        <div className="absolute left-5 text-neutral-600 group-focus-within:text-blue-500 transition-colors duration-300">
                            <Search size={20} strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search experts, builders, and high-frequency connectors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-8 py-4 rounded-[20px] bg-neutral-900/40 backdrop-blur-3xl border border-white/10 text-base text-white font-medium placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-500 shadow-2xl"
                        />
                    </div>
                </motion.div>
            </motion.div>

            <div className="space-y-6">
                <motion.div layout className="flex items-center gap-4 px-1">
                    <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] whitespace-nowrap">
                        {search ? "Telemetry Results" : "Suggested Network"}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent"></div>
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
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                                : "flex flex-col gap-6 max-w-4xl"
                            }
                        >
                            {(search ? results : suggestions).map((user) => (
                                <motion.div
                                    layout
                                    key={user.id}
                                    layoutId={`card-container-${user.id}`}
                                    whileHover={{ y: -5 }}
                                    transition={layoutTransition}
                                    className="group relative h-full"
                                >
                                    <motion.div layoutId={`card-glow-${user.id}`} className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/10 to-transparent rounded-[28px] blur-[10px] opacity-0 group-hover:opacity-100 transition duration-500" />

                                    {viewMode === "grid" ? (
                                        <motion.div 
                                            layout
                                            layoutId={`card-inner-${user.id}`}
                                            className="relative h-full flex flex-col items-center text-center p-6 rounded-[26px] border border-white/5 bg-neutral-900/50 backdrop-blur-3xl hover:border-white/20 transition-all duration-300 shadow-2xl overflow-hidden"
                                        >
                                            <motion.div layoutId={`avatar-box-${user.id}`} onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)} onMouseLeave={handleProfileMouseLeave} className="relative mb-4 shrink-0">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-colors duration-500 p-0.5 shadow-2xl bg-gradient-to-br from-white/10 to-transparent">
                                                    <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover rounded-full" />
                                                </div>
                                                <div className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-neutral-900 ${user.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-neutral-600'}`}></div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0 w-full mb-5">
                                                <motion.div layoutId={`name-${user.id}`}>
                                                    <Link to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`} className="block font-black text-sm text-white truncate hover:text-blue-400 no-underline tracking-tighter uppercase italic">
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                </motion.div>
                                                <motion.span layoutId={`handle-${user.id}`} className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1 truncate px-2">
                                                    @{user.username || user.email.split("@")[0]}
                                                </motion.span>
                                            </div>
                                            {currentUser?.id !== user.id && (
                                                <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFollow(user.id)} disabled={connectionStatuses[user.id]?.status === "connected" || connectionStatuses[user.id]?.status === "interested"} className={`w-full py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${connectionStatuses[user.id]?.status === "connected" ? "bg-green-500/10 text-green-500 border-green-500/20" : connectionStatuses[user.id]?.status === "interested" ? "bg-neutral-800 text-neutral-500 border-neutral-700" : "bg-white text-black border-transparent hover:bg-neutral-200 shadow-xl shadow-white/5"}`}>{getButtonText(user.id)}</motion.button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            layout
                                            layoutId={`card-inner-${user.id}`}
                                            className="relative flex items-center gap-8 p-6 rounded-[26px] border border-white/5 bg-neutral-900/50 backdrop-blur-3xl hover:border-white/20 transition-all duration-300 shadow-2xl group/card overflow-hidden"
                                        >
                                            <motion.div layoutId={`avatar-box-${user.id}`} onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)} onMouseLeave={handleProfileMouseLeave} className="relative shrink-0">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group-hover/card:border-blue-500/30 transition-all duration-500 shadow-2xl p-0.5 bg-gradient-to-br from-white/10 to-transparent">
                                                    <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover rounded-xl" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-neutral-900 ${user.isOnline ? 'bg-green-500' : 'bg-neutral-600'}`}></div>
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <motion.div layoutId={`name-${user.id}`}>
                                                    <Link to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`} className="inline-block font-black text-2xl text-white hover:text-blue-400 no-underline tracking-tighter uppercase italic">
                                                        {user.firstname} {user.lastname}
                                                    </Link>
                                                </motion.div>
                                                <div className="flex items-center gap-5 mt-1">
                                                    <motion.span layoutId={`handle-${user.id}`} className="text-[13px] text-neutral-500 font-bold uppercase tracking-widest">@{user.username || user.email.split("@")[0]}</motion.span>
                                                    <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                                                    <motion.p layoutId={`expertise-${user.id}`} className="text-[12px] text-neutral-400 font-medium italic line-clamp-1 truncate max-w-sm">
                                                        {user.expertise?.aboutYou || "Potential high-tier connector discovered."}
                                                    </motion.p>
                                                </div>
                                            </div>
                                            {currentUser?.id !== user.id && (
                                                <motion.button layoutId={`btn-${user.id}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleFollow(user.id)} disabled={connectionStatuses[user.id]?.status === "connected" || connectionStatuses[user.id]?.status === "interested"} className={`px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 border ${connectionStatuses[user.id]?.status === "connected" ? "bg-green-500/10 text-green-500 border-green-500/20" : connectionStatuses[user.id]?.status === "interested" ? "bg-neutral-800 text-neutral-500 border-neutral-700" : "bg-white text-black border-transparent hover:bg-neutral-200 shadow-2xl shadow-white/5"}`}>{getButtonText(user.id)}</motion.button>
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </LayoutGroup>
            </div>

            <ProfileHoverCard isVisible={showHoverCard} anchorRect={hoverAnchorRect} userId={hoverUserId} onMouseEnter={() => setShowHoverCard(true)} onMouseLeave={handleProfileMouseLeave} />

            <AnimatePresence>
                {snack && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, x: "-50%" }} animate={{ opacity: 1, scale: 1, x: "-50%" }} exit={{ opacity: 0, scale: 0.9, x: "-50%" }} className="fixed bottom-12 left-1/2 z-[100] px-12 py-6 bg-white text-black text-[11px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20">
                        {snack}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

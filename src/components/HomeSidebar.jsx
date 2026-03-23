import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import axiosClient from "../api/axiosClient";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import LoginModal from "./Authentication/LoginModal";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SwitchCamera, ChevronRight, UserPlus, CheckCircle2, RotateCw } from "lucide-react";

// Module-level cache: survives route changes, resets on full page refresh
let cachedSuggestions = null;

const HomeSidebar = () => {
    const { user: currentUser } = useUserContext();
    const [suggestedUsers, setSuggestedUsers] = useState(cachedSuggestions || []);
    const [loading, setLoading] = useState(!cachedSuggestions);
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef(null);

    // Funny toast state for footer
    const [funnySnack, setFunnySnack] = useState("");
    const funnyMessages = [
        "This button is currently taking a nap. 😴",
        "Maybe in the 2027 update? 🚀",
        "Clicking won't make it work faster, but it's cute! ✨",
        "Error 404: Motivation to build this page not found. 🤷‍♂️",
        "It's not broken, it's 'feature-limited'. 😉",
        "Shh... I'm a placeholder! 🤫",
        "This link is just for aesthetics. Premium, right? ✨",
        "You found a secret. It does nothing! 🎉"
    ];

    // Hover card state
    const [hoverUserId, setHoverUserId] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const [followStatuses, setFollowStatuses] = useState({});

    // Fetch suggestions (only if not cached)
    useEffect(() => {
        if (cachedSuggestions) return;

        const fetchSuggestions = async () => {
            try {
                const res = await axiosClient.get("/user/search/suggested");
                cachedSuggestions = res.data;
                setSuggestedUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleFooterClick = (link) => {
        const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        setFunnySnack(`${link}: ${randomMsg}`);
        setTimeout(() => setFunnySnack(""), 3000);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        cachedSuggestions = null;
        try {
            const res = await axiosClient.get("/user/search/suggested");
            cachedSuggestions = res.data;
            setSuggestedUsers(res.data);
        } catch (err) {
            console.error("Manual refresh failed:", err);
        } finally {
            // Smooth transition feel
            setTimeout(() => setRefreshing(false), 600);
        }
    };

    const handleFollow = async (e, userId) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await axiosClient.post(`/request/send/interested/${userId}`);
            setFollowStatuses(prev => ({
                ...prev,
                [userId]: true
            }));
        } catch (err) {
            console.error("Follow failed:", err);
        }
    };

    const handleProfileMouseEnter = (e, userId) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect();

        hoverTimeoutRef.current = setTimeout(() => {
            setHoverUserId(userId);
            setHoverAnchorRect({
                top: rect.top - parentRect.top,
                bottom: rect.bottom - parentRect.top,
                left: rect.left - parentRect.left,
                right: rect.right - parentRect.left,
                width: rect.width,
                height: rect.height
            });
            setShowHoverCard(true);
        }, 500);
    };

    const handleProfileMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverCard(false);
        }, 200);
    };

    if (!currentUser) return null;

    return (
        <div ref={containerRef} className="w-[320px] fixed pt-0 pr-4 pb-4 hidden lg:block">
            {/* Current User Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group mb-8 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <Link to="/profile" className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-60 transition-opacity" />
                            <img
                                src={currentUser.imageUrl || "https://github.com/shadcn.png"}
                                alt={currentUser.firstname}
                                className="relative w-12 h-12 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-lg"
                            />
                        </Link>
                        <div className="flex flex-col min-w-0">
                            <Link to="/profile" className="text-sm font-black text-black dark:text-white truncate uppercase tracking-tighter hover:text-blue-500 transition-colors">
                                {currentUser.firstname.toLowerCase()}_{currentUser.lastname.toLowerCase()}
                            </Link>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest opacity-70">
                                {currentUser.firstname} {currentUser.lastname}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all group/switch active:scale-90"
                        title="Switch Account"
                    >
                        <SwitchCamera size={16} className="group-hover/switch:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </motion.div>

            {/* Suggestions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500 animate-pulse" />
                        <span className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Curation for you</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/find/findpeople" className="text-[10px] font-black text-blue-500 hover:text-blue-600 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
                            Explore <ChevronRight size={12} />
                        </Link>
                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            title="Refresh Suggestions"
                            className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90 disabled:opacity-50 group/refresh"
                        >
                            <RotateCw size={12} className={`${refreshing ? "animate-spin" : "group-hover/refresh:rotate-180 transition-transform duration-500"}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between animate-pulse px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="flex flex-col gap-1">
                                        <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                    </div>
                                </div>
                                <div className="w-12 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                            </div>
                        ))
                    ) : (
                        <AnimatePresence>
                            {suggestedUsers.map((user, idx) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ scale: 1.04, y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative flex items-center justify-between group/suggest p-3 rounded-2xl bg-white/30 dark:bg-white/[0.02] border border-transparent hover:border-blue-500/25 dark:hover:border-blue-400/20 hover:bg-white/90 dark:hover:bg-white/[0.08] hover:shadow-[0_12px_40px_rgba(59,130,246,0.18)] transition-[background,border,box-shadow] duration-300 cursor-pointer"
                                    onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                    onMouseLeave={handleProfileMouseLeave}
                                >
                                    {/* Hover glow background */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover/suggest:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    
                                    <div className="relative flex items-center gap-3 min-w-0">
                                        <Link
                                            to={`/public-profile/${user.id}`}
                                            className="relative shrink-0"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/suggest:opacity-100 transition-opacity" />
                                            <img
                                                src={user.imageUrl || "https://github.com/shadcn.png"}
                                                alt={user.firstname}
                                                className="relative w-10 h-10 rounded-xl object-cover border border-neutral-100 dark:border-white/5 shadow-sm group-hover/suggest:scale-105 group-hover/suggest:shadow-md transition-all duration-300"
                                            />
                                        </Link>
                                        <div className="flex flex-col min-w-0">
                                            <div className="relative group/name inline-flex">
                                                <Link
                                                    to={`/public-profile/${user.id}`}
                                                    className="text-[11px] font-black text-black dark:text-white hover:underline truncate uppercase tracking-tight px-1.5 py-0.5 -mx-1.5 rounded-md transition-all duration-300 group-hover/name:bg-blue-500/10 group-hover/name:text-blue-500"
                                                >
                                                    {user.firstname.toLowerCase()}_{user.lastname.toLowerCase()}
                                                </Link>
                                                {/* User ID Tooltip */}
                                                <div className="absolute -top-8 left-0 px-2.5 py-1 bg-black/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-black text-[9px] font-bold tracking-wider rounded-full shadow-lg shadow-black/20 opacity-0 scale-90 pointer-events-none group-hover/name:opacity-100 group-hover/name:scale-100 transition-all duration-200 whitespace-nowrap z-50">
                                                    @{user.username || `${user.firstname.toLowerCase()}_${user.lastname.toLowerCase()}`}
                                                    <div className="absolute -bottom-1 left-3 w-2 h-2 bg-black/90 dark:bg-white/90 rotate-45" />
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter opacity-60 group-hover/suggest:opacity-90 transition-opacity">
                                                New Discovery
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleFollow(e, user.id)}
                                        disabled={followStatuses[user.id]}
                                        className={`relative shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${followStatuses[user.id]
                                                ? "bg-green-500/10 text-green-500 cursor-default"
                                                : "bg-black dark:bg-white text-white dark:text-black hover:scale-110 active:scale-95 shadow-md hover:shadow-blue-500/20"
                                            }`}
                                    >
                                        {followStatuses[user.id] ? <CheckCircle2 size={14} /> : <UserPlus size={14} />}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Footer Links */}
            <div className="mt-12 px-2 pb-8">
                <div className="flex flex-wrap gap-x-3 gap-y-2 mb-6">
                    {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Meta Verified'].map(link => (
                        <button
                            key={link}
                            onClick={() => handleFooterClick(link)}
                            className="text-[9px] text-neutral-400 hover:text-black dark:hover:text-white uppercase tracking-[0.1em] font-black transition-colors"
                        >
                            {link}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-neutral-100 dark:bg-white/5" />
                    <p className="text-[9px] text-neutral-300 dark:text-neutral-600 font-black uppercase tracking-[0.15em]">
                        © 2026 CLIQ
                    </p>
                    <div className="h-px flex-1 bg-neutral-100 dark:bg-white/5" />
                </div>
            </div>

            {/* Hover Card Container */}
            <div className="relative">
                <ProfileHoverCard
                    userId={hoverUserId}
                    isVisible={showHoverCard}
                    anchorRect={hoverAnchorRect}
                    onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setShowHoverCard(true);
                    }}
                    onMouseLeave={handleProfileMouseLeave}
                />
            </div>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />

            {/* Funny Toast */}
            <AnimatePresence>
                {funnySnack && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-6 right-6 z-[100] px-5 py-3 bg-white/10 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl"
                    >
                        <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-center">
                            {funnySnack}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomeSidebar;

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import axiosClient from "../api/axiosClient";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import LoginModal from "./Authentication/LoginModal";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SwitchCamera, ChevronRight, UserPlus, CheckCircle2 } from "lucide-react";

const HomeSidebar = () => {
    const { user: currentUser } = useUserContext();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    // Hover card state
    const [hoverUserId, setHoverUserId] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const [followStatuses, setFollowStatuses] = useState({});
    
    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axiosClient.get("/user/search/suggested");
                setSuggestedUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

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
                    <Link to="/find/findpeople" className="text-[10px] font-black text-blue-500 hover:text-blue-600 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
                        Explore <ChevronRight size={12} />
                    </Link>
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
                                    className="flex items-center justify-between group/suggest p-3 rounded-2xl bg-white/30 dark:bg-white/[0.02] border border-transparent hover:border-white/20 dark:hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Link
                                            to={`/public-profile/${user.id}`}
                                            onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                            onMouseLeave={handleProfileMouseLeave}
                                            className="relative shrink-0"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/suggest:opacity-100 transition-opacity" />
                                            <img
                                                src={user.imageUrl || "https://github.com/shadcn.png"}
                                                alt={user.firstname}
                                                className="relative w-10 h-10 rounded-xl object-cover border border-neutral-100 dark:border-white/5 shadow-sm"
                                            />
                                        </Link>
                                        <div className="flex flex-col min-w-0">
                                            <Link
                                                to={`/public-profile/${user.id}`}
                                                className="text-[11px] font-black text-black dark:text-white hover:underline truncate uppercase tracking-tight"
                                                onMouseEnter={(e) => handleProfileMouseEnter(e, user.id)}
                                                onMouseLeave={handleProfileMouseLeave}
                                            >
                                                {user.firstname.toLowerCase()}_{user.lastname.toLowerCase()}
                                            </Link>
                                            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter opacity-60">
                                                New Discovery
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleFollow(e, user.id)}
                                        disabled={followStatuses[user.id]}
                                        className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                                            followStatuses[user.id] 
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
            <div className="mt-12 px-2">
                <div className="flex flex-wrap gap-x-3 gap-y-2 mb-6">
                    {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Meta Verified'].map(link => (
                        <span key={link} className="text-[9px] text-neutral-400 cursor-pointer hover:text-black dark:hover:text-white uppercase tracking-[0.1em] font-black transition-colors">
                            {link}
                        </span>
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
        </div>
    );
};

export default HomeSidebar;

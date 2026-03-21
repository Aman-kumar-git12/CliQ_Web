import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, MessageSquare, Users as GroupsIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const ProfileHoverCard = ({ userId, isVisible, anchorRect, onMouseEnter, onMouseLeave }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState("none");

    useEffect(() => {
        if (isVisible && userId) {
            fetchData();
        }
    }, [isVisible, userId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/user/hover-card/${userId}`);
            setData(res.data);
            setConnectionStatus(res.data.connectionStatus);
            setError(null);
        } catch (err) {
            console.error("Error fetching hover card data:", err);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (connectionStatus !== "none" && connectionStatus !== "ignored") return;

        try {
            await axiosClient.post(`/request/send/interested/${userId}`);
            setConnectionStatus("interested");
            // Also update localStorage for consistency if needed (like in PublicProfile)
            localStorage.setItem(`connection_status_${userId}`, "interested");
        } catch (error) {
            console.error("Follow failed:", error);
        }
    };

    if (!anchorRect) return null;

    // Calculate position dynamically
    // Coordinates are now relative to the parent, so no need for scrollY/scrollX
    const showBelow = anchorRect.top < 300; // Increased threshold for better upward positioning
    
    const top = showBelow ? anchorRect.bottom + 10 : anchorRect.top - 10;
    const left = anchorRect.left + (anchorRect.width / 2);

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
                    }}
                    className="w-80 overflow-hidden"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Arrow / Tail (Top) */}
                    {showBelow && (
                        <div className="w-4 h-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-l border-neutral-200 dark:border-neutral-800 rotate-45 mx-auto -mb-2 z-[1] shadow-2xl relative top-2"></div>
                    )}
                    
                    <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs text-neutral-500">Fetching profile...</p>
                            </div>
                        ) : error ? (
                            <div className="py-4 text-center text-red-500 text-sm">{error}</div>
                        ) : (
                            <>
                                {/* Header with Avatar and Names */}
                                <Link 
                                    to={data.isMe ? "/profile" : `/public-profile/${userId}`}
                                    className="flex items-center gap-4 mb-5 group/header"
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover/header:opacity-50 transition duration-300"></div>
                                        <img
                                            src={data.imageUrl || "https://github.com/shadcn.png"}
                                            alt={data.firstname}
                                            className="relative w-16 h-16 rounded-full object-cover border-2 border-white dark:border-neutral-900 shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-black dark:text-white truncate leading-tight group-hover/header:text-blue-500 transition-colors">
                                            {data.firstname} {data.lastname}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                            @{data.username}
                                        </p>
                                    </div>
                                </Link>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">{data.postsCount}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">posts</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">{data.connectionsCount}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">connections</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-bold text-black dark:text-white">{data.groupsCount}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">groups</p>
                                    </div>
                                </div>

                                {/* Recent Posts */}
                                {data.recentPosts && data.recentPosts.length > 0 && (
                                    <div className="grid grid-cols-3 gap-1 mb-5 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800">
                                        {data.recentPosts.concat(Array(Math.max(0, 3 - data.recentPosts.length)).fill(null)).slice(0, 3).map((post, i) => (
                                            <div key={i} className="aspect-square bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                                                {post ? (
                                                    <Link to={`/post/${post.id}`} className="block w-full h-full">
                                                        {post.image ? (
                                                            <img src={post.image} className="w-full h-full object-cover hover:scale-110 transition duration-300" alt="Post" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                                                                <MessageSquare size={12} className="text-neutral-400" />
                                                            </div>
                                                        )}
                                                    </Link>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Button */}
                                {!data.isMe && (
                                    <button
                                        onClick={handleFollow}
                                        disabled={connectionStatus === "interested" || connectionStatus === "accepted"}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg
                                            ${connectionStatus === "accepted" 
                                                ? "bg-green-600 text-white cursor-default" 
                                                : connectionStatus === "interested" 
                                                ? "bg-neutral-800 text-gray-400 cursor-default" 
                                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 active:scale-[0.98]"
                                            }`}
                                    >
                                        {connectionStatus === "accepted" ? (
                                            <><Check size={16} /> Connected</>
                                        ) : connectionStatus === "interested" ? (
                                            "Request Sent"
                                        ) : (
                                            <><UserPlus size={16} /> Connect</>
                                        )}
                                    </button>
                                )}
                                
                                {data.isMe && (
                                    <Link 
                                        to="/profile" 
                                        className="block w-full py-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-xl font-bold text-sm text-center transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    >
                                        Edit Profile
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Arrow / Tail (Bottom) */}
                    {!showBelow && (
                        <div className="w-4 h-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-r border-b border-neutral-200 dark:border-neutral-800 rotate-45 mx-auto -mt-2 z-[-1] shadow-2xl"></div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileHoverCard;

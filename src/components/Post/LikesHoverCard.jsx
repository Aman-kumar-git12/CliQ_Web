import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User } from "lucide-react";
import axiosClient from "../../api/axiosClient";

const LikesHoverCard = ({ postId, isVisible, anchorRect, onMouseEnter, onMouseLeave }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isVisible && postId) {
            fetchLikes();
        }
    }, [isVisible, postId]);

    const fetchLikes = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/user/post/likes/users/${postId}`);
            setUsers(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching likes for hover:", err);
            setError("Failed to load likes");
        } finally {
            setLoading(false);
        }
    };

    if (!anchorRect) return null;

    // Robust Viewport Logic
    const estHeight = 250; // Estimated height for likes preview
    const spaceBelow = window.innerHeight - anchorRect.viewportTop - anchorRect.height;
    const spaceAbove = anchorRect.viewportTop;
    
    // Choose direction based on more available space or if it fits
    const showBelow = spaceBelow > spaceAbove || spaceBelow > estHeight;
    
    let top = showBelow ? anchorRect.bottom + 10 : anchorRect.top - 10;
    const left = anchorRect.left + (anchorRect.width / 2);

    // Clamping
    if (!showBelow) {
        const viewportTopPos = anchorRect.viewportTop - 10 - estHeight;
        if (viewportTopPos < 60) {
            const diff = 60 - viewportTopPos;
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
                    }}
                    className="w-64 overflow-hidden"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Arrow removed for "perfect box" look */}
                    
                    <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-3">
                        <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                            <Heart size={14} className="text-rose-500 fill-rose-500" />
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Liked by</h3>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-[9px] text-neutral-500 font-medium">Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="py-2 text-center text-red-500 text-[10px] whitespace-nowrap">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="py-4 text-center text-neutral-400 text-[11px] italic">No likes yet</div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-2.5 group/user">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                className="w-7 h-7 rounded-full object-cover border border-neutral-100 dark:border-neutral-800 group-hover/user:scale-105 transition-transform"
                                            />
                                        ) : null}
                                        <div
                                            style={{ display: user.avatar ? 'none' : 'flex' }}
                                            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] items-center justify-center text-white text-[10px] font-black border border-neutral-800 group-hover/user:scale-105 transition-transform"
                                        >
                                            {user.username?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <span className="text-[12px] font-bold text-black dark:text-white truncate">
                                            {user.username}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Arrow removed for "perfect box" look */}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LikesHoverCard;

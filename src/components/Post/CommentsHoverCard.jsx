import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

const CommentsHoverCard = ({ postId, isVisible, anchorRect, onMouseEnter, onMouseLeave }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isVisible && postId) {
            fetchComments();
        }
    }, [isVisible, postId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/user/post/comments/${postId}`);
            // Take only the first 3 comments for preview
            setComments(res.data.slice(0, 3));
            setError(null);
        } catch (err) {
            console.error("Error fetching comments for hover:", err);
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    if (!anchorRect) return null;

    // Robust Viewport Logic
    const estHeight = 400; // Estimated height for comments preview
    const spaceBelow = window.innerHeight - anchorRect.viewportTop - anchorRect.height;
    const spaceAbove = anchorRect.viewportTop;
    
    // Choose direction based on more available space or if it fits
    const showBelow = spaceBelow > spaceAbove || spaceBelow > estHeight;
    
    let top = showBelow ? anchorRect.bottom + 10 : anchorRect.top - 10;
    const left = anchorRect.left + (anchorRect.width / 2);

    // Clamping (Upward only for now as showing above is usually where it hits the header)
    if (!showBelow) {
        const viewportTopPos = anchorRect.viewportTop - 10 - estHeight;
        if (viewportTopPos < 60) { // Keep space for mobile top bar/header
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
                    className="w-72 overflow-hidden"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    {/* Arrow / Tail (Top) */}
                    {/* Arrow removed for "perfect box" look */}
                    
                    <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-4">
                        <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                            <MessageSquare size={16} className="text-blue-500" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Recent Comments</h3>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-[10px] text-neutral-500 font-medium tracking-tight">Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="py-4 text-center text-red-500 text-[11px] font-medium">{error}</div>
                        ) : comments.length === 0 ? (
                            <div className="py-6 text-center text-neutral-400 text-xs italic">No comments yet. Be the first!</div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 items-start group/comment">
                                        <div className="relative shrink-0">
                                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur opacity-0 group-hover/comment:opacity-100 transition duration-300"></div>
                                            {comment.avatar ? (
                                                <img
                                                    src={comment.avatar}
                                                    alt={comment.username}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    className="relative w-8 h-8 rounded-full object-cover border border-neutral-100 dark:border-neutral-800 shadow-sm"
                                                />
                                            ) : null}
                                            <div
                                                style={{ display: comment.avatar ? 'none' : 'flex' }}
                                                className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] items-center justify-center text-white text-[11px] font-black border border-neutral-800 shadow-sm"
                                            >
                                                {comment.username?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-black dark:text-white leading-tight truncate">
                                                {comment.username}
                                            </p>
                                            <p className="text-[12px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-snug mt-1">
                                                {comment.comment}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                <Link 
                                    to={`/post/${postId}`}
                                    className="flex items-center justify-between w-full mt-2 py-2 px-3 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl text-[11px] font-bold text-blue-500 transition-all group/link"
                                >
                                    <span>View all comments</span>
                                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    {/* Arrow / Tail (Bottom) */}
                    {/* Arrow removed for "perfect box" look */}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommentsHoverCard;

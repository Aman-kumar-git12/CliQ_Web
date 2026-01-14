import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, Plus, Flag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useFeedContext } from "../context/FeedContext";
import Toastbar from "./Chat/Toastbar";
import ReportModal from "./ReportModal";

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    const { updateFeedPost } = useFeedContext();
    const [liked, setLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likes || 0);
    const [isLiking, setIsLiking] = useState(false);

    // Sync local state with props (Important for navigation back/forth)
    useEffect(() => {
        setLiked(post?.isLiked || false);
        setLikesCount(post?.likes || 0);
    }, [post]);

    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reported, setReported] = useState(post?.isReported || false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipTimeoutRef = useRef(null);

    const handleMouseEnter = (name) => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        setActiveTooltip(name);
        tooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(null);
        }, 1500);
    };

    const handleMouseLeave = () => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        setActiveTooltip(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && !event.target.closest('.post-menu-container')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    if (!post) return null;

    const toggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to post page

        if (isLiking) return;

        const previousLiked = liked;
        const previousCount = likesCount;

        // Optimistic UI update
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        setIsLiking(true);

        try {
            const res = await axiosClient.post(`/user/post/like/${post.id}`, {}, { withCredentials: true });
            setLiked(res.data.isLiked);

            // Re-fetch accurate count
            const countRes = await axiosClient.get(`/user/post/likes/count/${post.id}`, { withCredentials: true });
            setLikesCount(countRes.data.likesCount);

            // Sync with global feed
            updateFeedPost(post.id, (p) => ({
                isLiked: res.data.isLiked,
                likes: countRes.data.likesCount
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
            // Rollback on error
            setLiked(previousLiked);
            setLikesCount(previousCount);
        } finally {
            setIsLiking(false);
        }
    };

    const handleActionClick = (e, message) => {
        e.preventDefault();
        e.stopPropagation();
        setToastMessage(message);
        setShowToast(true);
    };

    const openReportModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowReportModal(true);
        setShowMenu(false);
    };

    const handleReportPost = async (reason) => {
        setIsReporting(true);
        try {
            await axiosClient.post(`/user/post/report/${post.id}`, { reason }, { withCredentials: true });
            setToastMessage("Post reported successfully 🫡");
            setShowToast(true);
            setShowReportModal(false);
            setReported(true);
        } catch (error) {
            console.error("Error reporting post:", error);
            setToastMessage("Failed to report post ❌");
            setShowToast(true);
        } finally {
            setIsReporting(false);
        }
    };

    // Ensure content fallback
    const text = post.text || post.content || "";

    return (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition cursor-pointer">
            <div className="flex gap-3">

                {/* LEFT: Avatar + Line */}
                <div className="flex flex-col items-center">
                    <Link to={`/public-profile/${post.userId}`} className="relative w-11 h-11">
                        <img
                            src={post.avatar || "https://github.com/shadcn.png"}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />

                    </Link>

                    {/* Line */}
                    <div className="w-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 rounded-full" />
                </div>

                {/* RIGHT: Content */}
                <div className="flex-1 min-w-0">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Link to={`/public-profile/${post.userId}`} className="font-semibold text-black dark:text-white hover:underline">
                                {post.username || "Anonymous"}
                            </Link>
                            <span className="text-neutral-400 text-xs text-center flex items-center">
                                •
                            </span>
                            <span className="text-neutral-400 text-xs">
                                {post.time || "Just now"}
                            </span>
                        </div>

                        <div className="relative post-menu-container">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition text-neutral-500"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fadeIn">
                                    <button
                                        onClick={reported ? null : openReportModal}
                                        disabled={reported}
                                        className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition ${reported
                                            ? 'text-gray-400 cursor-default'
                                            : 'text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Flag size={14} className={reported ? 'text-gray-400' : 'text-red-500'} />
                                        {reported ? "Reported" : "Report"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Post Text & Image - Clickable */}
                    <Link to={`/post/${post.id}`} className="block group">
                        <p className="text-[15px] text-black dark:text-white leading-snug mb-3 whitespace-pre-wrap">
                            {text}
                        </p>

                        {/* IMAGES */}
                        {(() => {
                            const imgSrc = post.image || post.images;
                            const images = Array.isArray(imgSrc) ? imgSrc : imgSrc ? [imgSrc] : [];

                            if (images.length === 0) return null;

                            return (
                                <div
                                    className={`
                                        flex gap-2 mb-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 
                                        ${images.length > 1 ? "h-60 sm:h-72" : "h-auto"}
                                    `}
                                >
                                    {images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            className={`
                                                object-cover 
                                                ${images.length === 1 ? "w-full rounded-xl max-h-[450px]" : "w-full h-full"}
                                            `}
                                        />
                                    ))}
                                </div>
                            );
                        })()}
                    </Link>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-6 mt-3 text-neutral-600 dark:text-neutral-400">

                        <button
                            onClick={toggleLike}
                            onMouseEnter={() => handleMouseEnter('like')}
                            onMouseLeave={handleMouseLeave}
                            className={`group relative flex items-center transition-colors ${liked ? 'text-rose-500' : 'hover:text-rose-500 text-neutral-600 dark:text-neutral-400'}`}
                        >
                            {likesCount > 0 && (
                                <span className="text-sm font-semibold mr-1.5">{likesCount}</span>
                            )}
                            <div className="p-1.5 rounded-full group-hover:bg-rose-500/10 transition-colors">
                                <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
                            </div>
                            {/* Tooltip */}
                            <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-neutral-200 dark:border-neutral-700 ${activeTooltip === 'like' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                Like
                            </span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/post/${post.id}?comment=true`);
                            }}
                            onMouseEnter={() => handleMouseEnter('comments')}
                            onMouseLeave={handleMouseLeave}
                            className="group relative flex items-center hover:text-blue-500 transition"
                        >
                            {post.comments > 0 && (
                                <span className="text-sm font-semibold mr-1.5">{post.comments}</span>
                            )}
                            <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                                <MessageCircle size={18} />
                            </div>
                            {/* Tooltip */}
                            <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-neutral-200 dark:border-neutral-700 ${activeTooltip === 'comments' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                Comments
                            </span>
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "Remix is on a coffee break ☕")}
                            onMouseEnter={() => handleMouseEnter('remix')}
                            onMouseLeave={handleMouseLeave}
                            className="group relative flex items-center hover:text-green-500 transition"
                        >
                            {post.reposts > 0 && (
                                <span className="text-sm font-semibold mr-1.5">{post.reposts}</span>
                            )}
                            <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                                <Repeat size={18} />
                            </div>
                            {/* Tooltip */}
                            <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-neutral-200 dark:border-neutral-700 ${activeTooltip === 'remix' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                Remix
                            </span>
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "This post is feeling a little too private 🤫")}
                            onMouseEnter={() => handleMouseEnter('share')}
                            onMouseLeave={handleMouseLeave}
                            className="group relative flex items-center hover:text-yellow-500 transition"
                        >
                            {post.shares > 0 && (
                                <span className="text-sm font-semibold mr-1.5">{post.shares}</span>
                            )}
                            <div className="p-1.5 rounded-full group-hover:bg-yellow-500/10 transition-colors">
                                <Send size={18} />
                            </div>
                            {/* Tooltip */}
                            <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-neutral-200 dark:border-neutral-700 ${activeTooltip === 'share' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                Share
                            </span>
                        </button>
                    </div>

                    {showToast && (
                        <Toastbar
                            message={toastMessage}
                            onClose={() => setShowToast(false)}
                        />
                    )}
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onReport={handleReportPost}
                isReporting={isReporting}
            />
        </div>
    );
};

export default PostCard;

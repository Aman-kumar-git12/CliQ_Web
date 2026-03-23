import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Repeat, Send, MoreHorizontal, Plus, Flag, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useFeedContext } from "../context/FeedContext";
import Toastbar from "./Chat/Toastbar";
import ReportModal from "./ReportModal";
import ProfileHoverCard from "./Post/ProfileHoverCard";
import CommentsHoverCard from "./Post/CommentsHoverCard";
import LikesHoverCard from "./Post/LikesHoverCard";
import { useUserContext } from "../context/userContext";

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { updateFeedPost } = useFeedContext();
    const { user: currentUser } = useUserContext();
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

    // Hover Card State
    const [hoverUserId, setHoverUserId] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimeoutRef = useRef(null);

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
                viewportTop: rect.top,
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
        }, 200); // Small delay to allow moving mouse to the card
    };

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handleCardMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowHoverCard(false);
    };

    // Comments Hover Card State
    const [showCommentsHover, setShowCommentsHover] = useState(false);
    const [commentsAnchorRect, setCommentsAnchorRect] = useState(null);
    const commentsHoverTimeoutRef = useRef(null);

    const handleCommentsMouseEnter = (e) => {
        if (commentsHoverTimeoutRef.current) clearTimeout(commentsHoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect();

        commentsHoverTimeoutRef.current = setTimeout(() => {
            setCommentsAnchorRect({
                top: rect.top - parentRect.top,
                bottom: rect.bottom - parentRect.top,
                left: rect.left - parentRect.left,
                right: rect.right - parentRect.left,
                viewportTop: rect.top,
                width: rect.width,
                height: rect.height
            });
            setShowCommentsHover(true);
        }, 500);
    };

    const handleCommentsMouseLeave = () => {
        if (commentsHoverTimeoutRef.current) clearTimeout(commentsHoverTimeoutRef.current);
        commentsHoverTimeoutRef.current = setTimeout(() => {
            setShowCommentsHover(false);
        }, 200);
    };

    const handleCommentsCardMouseEnter = () => {
        if (commentsHoverTimeoutRef.current) clearTimeout(commentsHoverTimeoutRef.current);
    };

    const handleCommentsCardMouseLeave = () => {
        if (commentsHoverTimeoutRef.current) clearTimeout(commentsHoverTimeoutRef.current);
        setShowCommentsHover(false);
    };

    // Likes Hover Card State
    const [showLikesHover, setShowLikesHover] = useState(false);
    const [likesAnchorRect, setLikesAnchorRect] = useState(null);
    const likesHoverTimeoutRef = useRef(null);

    const handleLikesMouseEnter = (e) => {
        if (likesHoverTimeoutRef.current) clearTimeout(likesHoverTimeoutRef.current);
        const rect = e.currentTarget.getBoundingClientRect();
        const parentRect = containerRef.current.getBoundingClientRect();

        likesHoverTimeoutRef.current = setTimeout(() => {
            setLikesAnchorRect({
                top: rect.top - parentRect.top,
                bottom: rect.bottom - parentRect.top,
                left: rect.left - parentRect.left,
                right: rect.right - parentRect.left,
                viewportTop: rect.top,
                width: rect.width,
                height: rect.height
            });
            setShowLikesHover(true);
        }, 500);
    };

    const handleLikesMouseLeave = () => {
        if (likesHoverTimeoutRef.current) clearTimeout(likesHoverTimeoutRef.current);
        likesHoverTimeoutRef.current = setTimeout(() => {
            setShowLikesHover(false);
        }, 200);
    };

    const handleLikesCardMouseEnter = () => {
        if (likesHoverTimeoutRef.current) clearTimeout(likesHoverTimeoutRef.current);
    };

    const handleLikesCardMouseLeave = () => {
        if (likesHoverTimeoutRef.current) clearTimeout(likesHoverTimeoutRef.current);
        setShowLikesHover(false);
    };

    const handleMouseEnter = (type) => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        setActiveTooltip(type);
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

    const handleLike = async (e) => {
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
        <div ref={containerRef} className="flex flex-col mb-8 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg relative group p-4">
            <div className="flex gap-4">

                {/* LEFT: Avatar + Line */}
                <div className="flex flex-col items-center">
                    <Link
                        to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                        className="relative w-11 h-11 shrink-0"
                        onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                        onMouseLeave={handleProfileMouseLeave}
                    >
                        <img
                            src={post.avatar || "https://github.com/shadcn.png"}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 shadow-sm"
                        />
                    </Link>
                    <div className="w-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 rounded-full" />
                </div>

                {/* RIGHT: CONTENT */}
                <div className="flex-1 min-w-0">

                    {/* Header: Username + Time */}
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <Link
                                to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                                className="font-bold text-sm text-black dark:text-white hover:underline transition-all"
                                onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                                onMouseLeave={handleProfileMouseLeave}
                            >
                                {post.username || "Anonymous"}
                            </Link>
                            <span className="text-neutral-500 text-xs">•</span>
                            <span className="text-neutral-500 text-[11px]">{post.time || "Just now"}</span>
                        </div>

                        <div className="relative post-menu-container">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition text-neutral-500"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={reported ? null : openReportModal}
                                        disabled={reported}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 text-sm transition ${reported
                                            ? 'text-gray-400 cursor-default'
                                            : 'text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Flag size={16} className={reported ? 'text-gray-400' : 'text-red-500'} />
                                        {reported ? "Reported" : "Report"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN CONTENT (Image & Text) */}
                    <Link to={`/post/${post.id}`} className="block">
                        <div className="px-0 py-1">
                            <p className="text-[15px] text-black dark:text-white leading-snug whitespace-pre-wrap mb-3">
                                {text}
                            </p>
                        </div>

                        {/* IMAGE AREA */}
                        {(() => {
                            const imgSrc = post.image || post.images;
                            const images = Array.isArray(imgSrc) ? imgSrc : imgSrc ? [imgSrc] : [];
                            if (images.length === 0) return null;
                            return (
                                <div className="w-full h-[500px] bg-neutral-100 dark:bg-neutral-950 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-3">
                                    {images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            className="w-full h-full object-contain"
                                        />
                                    ))}
                                </div>
                            );
                        })()}
                    </Link>

                    {/* ACTIONS BAR */}
                    <div className="flex items-center gap-5 mt-2 text-neutral-500 dark:text-neutral-400">
                        <button
                            onClick={handleLike}
                            onMouseEnter={(e) => {
                                handleMouseEnter('like');
                                handleLikesMouseEnter(e);
                            }}
                            onMouseLeave={() => {
                                handleMouseLeave();
                                handleLikesMouseLeave();
                            }}
                            className={`transition hover:scale-110 active:scale-90 ${liked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                        >
                            <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
                        </button>

                        <button
                            onClick={() => navigate(`/post/${post.id}`)}
                            onMouseEnter={(e) => {
                                handleMouseEnter('comments');
                                handleCommentsMouseEnter(e);
                            }}
                            onMouseLeave={() => {
                                handleMouseLeave();
                                handleCommentsMouseLeave();
                            }}
                            className="hover:scale-110 active:scale-90 transition hover:text-blue-500"
                        >
                            <MessageCircle size={20} />
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "Remix is on a break ☕")}
                            className="hover:scale-110 active:scale-90 transition hover:text-green-500"
                        >
                            <Repeat size={18} />
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, "Sharing... 📤")}
                            className="hover:scale-110 active:scale-90 transition hover:text-yellow-500 -rotate-12"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* LIKES & COMMENTS INFO */}
                    <div className="mt-3 flex flex-col gap-1">
                        {(likesCount > 0 || post.comments > 0) && (
                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                                {likesCount > 0 && (
                                    <button
                                        className="hover:text-black dark:hover:text-white transition-colors"
                                        onMouseEnter={(e) => handleLikesMouseEnter(e)}
                                        onMouseLeave={handleLikesMouseLeave}
                                    >
                                        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                                    </button>
                                )}
                                {likesCount > 0 && post.comments > 0 && <span>•</span>}
                                {post.comments > 0 && (
                                    <button
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="hover:text-black dark:hover:text-white transition-colors"
                                        onMouseEnter={(e) => handleCommentsMouseEnter(e)}
                                        onMouseLeave={handleCommentsMouseLeave}
                                    >
                                        {post.comments} comments
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showToast && (
                <Toastbar
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onReport={handleReportPost}
                isReporting={isReporting}
            />

            <ProfileHoverCard
                userId={hoverUserId}
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
            />

            <CommentsHoverCard
                postId={post.id}
                isVisible={showCommentsHover}
                anchorRect={commentsAnchorRect}
                onMouseEnter={handleCommentsCardMouseEnter}
                onMouseLeave={handleCommentsCardMouseLeave}
            />

            <LikesHoverCard
                postId={post.id}
                isVisible={showLikesHover}
                anchorRect={likesAnchorRect}
                onMouseEnter={handleLikesCardMouseEnter}
                onMouseLeave={handleLikesCardMouseLeave}
            />
        </div>
    );
};

export default PostCard;

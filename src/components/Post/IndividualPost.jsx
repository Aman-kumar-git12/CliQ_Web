import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Heart,
    MessageCircle,
    Repeat,
    Send,
    MoreHorizontal,
    Share2,
    CheckCircle2,
    Flag
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useUserContext } from "../../context/userContext";
import { useFeedContext } from "../../context/FeedContext";
import Confirmation from "../Confirmation";
import Toastbar from "../Chat/Toastbar";
import ReportModal from "../ReportModal";
import ProfileHoverCard from "./ProfileHoverCard";
import LikesHoverCard from "./LikesHoverCard";
import { AnimatePresence } from "framer-motion";


import IndividualPostShimmering from "../shimmering/IndividualPostShimmering";

export default function IndividualPost() {
    const { postId } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user: currentUser } = useUserContext(); // Renamed user to currentUser
    const { updateFeedPost } = useFeedContext();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState({ type: 'post', id: null });
    const isEditing = location.pathname.endsWith("/edit");
    const [editContent, setEditContent] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("info");
    const [reportedPost, setReportedPost] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipTimeoutRef = useRef(null);
    const commentsRef = useRef(null);

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

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handleCardMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowHoverCard(false);
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

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!loading && showComments && commentsRef.current) {
            // Wait for animation to start
            setTimeout(() => {
                commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else if (!loading && !showComments && !isFirstRender.current) {
            // Scroll to top smoothly when comments are closed, but not on initial load
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (!loading && isFirstRender.current) {
            isFirstRender.current = false;
        }
    }, [showComments, loading]);

    // sync showComments with URL query param
    useEffect(() => {
        const commentParam = searchParams.get('comment');
        if (commentParam === 'true') {
            setShowComments(true);
        } else if (commentParam === 'false' || !commentParam) {
            setShowComments(false);
        }
    }, [searchParams]);

    const toggleComments = () => {
        const nextState = !showComments;
        // Update URL first, let the useEffect handle the state
        const newParams = new URLSearchParams(searchParams);
        if (nextState) {
            newParams.set('comment', 'true');
        } else {
            newParams.delete('comment');
        }
        setSearchParams(newParams);
    };

    // sync showReportModal with URL query param
    useEffect(() => {
        const reportParam = searchParams.get('report');
        if (reportParam === 'true') {
            setReportTarget({ type: 'post', id: postId });
            setShowReportModal(true);
        } else {
            setShowReportModal(false);
        }
    }, [searchParams, postId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId && !event.target.closest('.comment-menu-container')) {
                setActiveMenuId(null);
            }
            if (showPostMenu && !event.target.closest('.post-menu-container')) {
                setShowPostMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenuId]);

    useEffect(() => {
        if (!postId || postId === "undefined") {
            setLoading(false);
            return;
        }

        if (isEditing && post) {
            setEditContent(post.content || "");
        }
    }, [isEditing, post]);

    // Check connection status
    const [connectionStatus, setConnectionStatus] = useState("none");

    useEffect(() => {
        if (post?.userId && currentUser?.id && post.userId !== currentUser.id) {
            const checkConnection = async () => {
                try {
                    const res = await axiosClient.get(`/user/connections/${post.userId}`, { withCredentials: true });
                    setConnectionStatus(res.data.status);
                } catch (error) {
                    console.error("Error checking connection status:", error);
                }
            };
            checkConnection();
        }
    }, [post, currentUser]);

    const handleFollow = async () => {
        if (!post?.userId) return;

        try {
            await axiosClient.post(`/request/send/interested/${post.userId}`, {}, { withCredentials: true });
            setConnectionStatus("interested");
            setToastMessage("Follow request sent 🚀");
            setShowToast(true);
        } catch (error) {
            console.error("Error sending follow request:", error);
            setToastMessage("Failed to send request ❌");
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (!postId || postId === "undefined") {
            setLoading(false);
            return;
        }

        const fetchPostAndComments = async () => {
            try {
                // Fetch Post
                const postRes = await axiosClient.get(`/user/post/${postId}`, { withCredentials: true });
                const postData = Array.isArray(postRes.data) ? postRes.data[0] : postRes.data;
                setPost(postData);
                setLikesCount(postData.likes || 0);
                setLiked(postData.isLiked || false);
                setReportedPost(postData.isReported || false);

                if (isEditing) {
                    setEditContent(postData.content || "");
                }

                // Fetch Comments
                const commentsRes = await axiosClient.get(`/user/post/comments/${postId}`, { withCredentials: true });
                setComments(commentsRes.data || []);
            } catch (error) {
                console.error("Error fetching post data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (location.state?.focusComments) {
            setSearchParams({ comment: 'true' });
        }

        fetchPostAndComments();
    }, [postId, location.state]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const res = await axiosClient.post(`/user/post/comments/${postId}`, { comment: newComment }, { withCredentials: true });

            // Add new comment to UI immediately
            const commentToAdd = {
                ...res.data,
                username: currentUser.firstname + " " + currentUser.lastname,
                avatar: currentUser.imageUrl,
                createdAt: new Date().toISOString()
            };
            setComments([commentToAdd, ...comments]);
            setNewComment("");

            // Update local post state
            setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));

            // Sync with global feed (Incremental)
            updateFeedPost(postId, (p) => ({ comments: (p.comments || 0) + 1 }));
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!deletingCommentId || isDeleting) return;

        setIsDeleting(true);
        try {
            await axiosClient.delete(`/user/post/comments/${deletingCommentId}`, { withCredentials: true });
            setComments(prev => prev.filter(c => c.id !== deletingCommentId));
            setShowDeleteConfirm(false);
            setDeletingCommentId(null);

            // Update local post state
            setPost(prev => ({ ...prev, comments: Math.max(0, (prev.comments || 0) - 1) }));

            // Sync with global feed (Decremental)
            updateFeedPost(postId, (p) => ({ comments: Math.max(0, (p.comments || 0) - 1) }));
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeletePost = async () => {
        setIsDeletingPost(true);
        try {
            await axiosClient.delete(`/delete/post/${postId}`, { withCredentials: true });
            navigate("/profile");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete post.");
        } finally {
            setIsDeletingPost(false);
            setShowDeletePostConfirm(false);
        }
    };

    const handleSaveEdit = async () => {
        setIsSavingEdit(true);
        try {
            await axiosClient.put(`/update/post/${postId}`, { content: editContent }, { withCredentials: true });
            setPost(prev => ({ ...prev, content: editContent }));
            navigate(`/post/${postId}`, { replace: true });
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update post.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setEditContent(post.content);
        navigate(`/post/${postId}`, { replace: true });
    };

    const toggleLike = async () => {
        const previousLiked = liked;
        const previousCount = likesCount;

        // Optimistic UI update
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);

        try {
            const res = await axiosClient.post(`/user/post/like/${postId}`, {}, { withCredentials: true });
            // Sync with server response
            setLiked(res.data.isLiked);
            // Re-fetch count to be accurate
            const countRes = await axiosClient.get(`/user/post/likes/count/${postId}`, { withCredentials: true });
            setLikesCount(countRes.data.likesCount);

            // Sync with global feed (Toggle)
            updateFeedPost(postId, (p) => ({
                isLiked: res.data.isLiked,
                likes: countRes.data.likesCount,
                // Optional: if backend doesn't return count, we could toggle manually:
                // isLiked: !p.isLiked,
                // likes: !p.isLiked ? p.likes + 1 : p.likes - 1
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
            // Rollback on error
            setLiked(previousLiked);
            setLikesCount(previousCount);
        }
    };

    const handleActionClick = (message, type = "info") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const openReportModal = (type, id) => {
        if (type === 'post') {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('report', 'true');
            setSearchParams(newParams);
            setShowPostMenu(false);
        } else {
            setReportTarget({ type, id });
            setShowReportModal(true);
            setActiveMenuId(null);
        }
    };

    const closeReportModal = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('report');
        setSearchParams(newParams);
        setShowReportModal(false);
    };

    const handleReportPost = async (reason) => {
        setIsReporting(true);
        try {
            const endpoint = reportTarget.type === 'post'
                ? `/user/post/report/${postId}`
                : `/user/comment/report/${reportTarget.id}`;

            await axiosClient.post(endpoint, { reason }, { withCredentials: true });
            setToastMessage(`${reportTarget.type === 'post' ? 'Post' : 'Comment'} reported successfully 🫡`);
            setToastType("success");
            setShowToast(true);
            closeReportModal();

            if (reportTarget.type === 'post') {
                setReportedPost(true);
            } else {
                setComments(prev => prev.map(c =>
                    c.id === reportTarget.id ? { ...c, isReported: true } : c
                ));
            }
        } catch (error) {
            console.error("Error reporting:", error);
            setToastMessage("Failed to report ❌");
            setToastType("error");
            setShowToast(true);
        } finally {
            setIsReporting(false);
        }
    };

    if (loading) return <IndividualPostShimmering />;

    if (!post) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#08080C] text-white p-4 relative overflow-hidden">
            {/* Ambient Background Glows for Not Found State */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-2xl font-black mb-6 italic uppercase tracking-wider">Post Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-white text-black font-black uppercase text-[12px] tracking-widest rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
                >
                    Return Home
                </button>
            </div>
        </div>
    );

    const isOwner = currentUser?.id === post.userId;

    return (
        <div ref={containerRef} className="min-h-screen bg-[#08080C] text-white relative overflow-x-hidden no-scrollbar transition-all duration-500">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />

            {/* Cinematic Background Glows - Restored locally as Layout.jsx was reverted */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ec4899]/5 rounded-full blur-[140px] pointer-events-none z-0" />
            
            {/* Grid Overlay */}
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
                style={{ 
                    backgroundImage: `linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)`,
                    backgroundSize: '40px 40px' 
                }} 
            />

            <main className="max-w-[640px] mx-auto pt-6 md:pt-10 pb-24 relative z-10">
                {/* Integrated Navigation Row */}
                <div className="px-4 mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-all border border-white/5">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {isOwner ? (
                            <div className="flex items-center gap-2">
                                {!isEditing && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/post/${postId}/edit`)}
                                            className="p-2 text-blue-400/60 hover:text-blue-400 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                                            title="Edit Post"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeletePostConfirm(true)}
                                            className="p-2 text-red-400/60 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="relative post-menu-container">
                                <button
                                    onClick={() => setShowPostMenu(!showPostMenu)}
                                    className="p-2 text-white/30 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                {showPostMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#0F0F1A] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl">
                                        <button
                                            onClick={reportedPost ? null : () => openReportModal('post', postId)}
                                            disabled={reportedPost}
                                            className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${reportedPost
                                                ? 'text-gray-500 cursor-default'
                                                : 'text-red-500 hover:bg-white/5'
                                                }`}
                                        >
                                            <Flag size={14} className={reportedPost ? 'text-gray-500' : 'text-red-500'} />
                                            <span className="font-bold text-[11px] uppercase tracking-wider">{reportedPost ? 'Reported' : 'Report Post'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Body */}
                <article className="px-4 py-2 space-y-3">
                    {/* User Profile Info */}
                    <div className="flex items-center justify-between">
                        <Link
                            to={currentUser?.id === post.userId ? "/profile" : `/public-profile/${post.userId}`}
                            className="flex items-center space-x-3 group"
                            onMouseEnter={(e) => handleProfileMouseEnter(e, post.userId)}
                            onMouseLeave={handleProfileMouseLeave}
                        >
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#8b5cf6] to-[#f472b6] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
                                <img
                                    src={post.avatar || "https://github.com/shadcn.png"}
                                    alt={post.username}
                                    className="relative w-11 h-11 rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            <div>
                                <h3 className="font-black text-[15px] text-white group-hover:text-[var(--cliq-lilac)] transition-colors tracking-tight">
                                    {post.username}
                                </h3>
                                <p className="text-[#8b86a6] text-[15px] leading-tight">@{post.username?.replace(/\s+/g, '').toLowerCase() || "user"}</p>
                            </div>
                        </Link>
                        {!isOwner && (
                            <button
                                onClick={handleFollow}
                                disabled={connectionStatus === 'accepted' || connectionStatus === 'interested'}
                                className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all duration-300 ${connectionStatus === 'accepted'
                                    ? 'bg-transparent border border-white/20 text-white cursor-default'
                                    : connectionStatus === 'interested'
                                        ? 'bg-transparent border border-white/20 text-white/60 cursor-default'
                                        : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                {connectionStatus === 'accepted' ? 'Following' : connectionStatus === 'interested' ? 'Requested' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mt-2">
                        {isEditing ? (
                            <>
                                <style>
                                    {`
                                        .custom-resize-handle::-webkit-resizer {
                                            border-style: solid;
                                            border-width: 0 0 12px 12px;
                                            border-color: transparent transparent #555 transparent;
                                        }
                                        .custom-resize-handle:hover::-webkit-resizer {
                                             border-color: transparent transparent #8b5cf6 transparent;
                                        }
                                    `}
                                </style>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="custom-resize-handle w-full h-24 bg-[#111] border border-[#2f3336] rounded-xl p-4 text-white focus:outline-none focus:border-[#8b5cf6] resize-y text-[15px] md:text-[17px] leading-relaxed"
                                    placeholder="Edit your post content..."
                                />
                            </>
                        ) : (
                            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#ebe7f7] font-medium whitespace-pre-wrap">
                                {post.content}
                            </p>
                        )}

                        {(post.image || post.video) && (
                            <div className="rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center w-full h-[500px] bg-white/[0.02] border border-white/[0.05] mb-2 group/media mt-2">
                                {post.video ? (
                                    <video
                                        src={post.video}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={post.image}
                                        alt="Post"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        )}
                        <div className="text-[15px] text-[#8b86a6] my-3">
                            {post.time || "4:20 PM · Apr 1, 2026"}
                        </div>
                    </div>

                    {/* Interaction Buttons - Re-styled with counts, border-b, and tooltips */}
                    <div className="flex items-center justify-between py-4 border-y border-white/[0.05]">
                        {isEditing ? (
                            <div className="flex justify-end gap-3 w-full">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isSavingEdit}
                                    className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSavingEdit}
                                    className="px-6 py-2 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition font-bold shadow-lg disabled:opacity-50 text-sm"
                                >
                                    {isSavingEdit ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={toggleLike}
                                    onMouseEnter={(e) => {
                                        handleMouseEnter('like');
                                        handleLikesMouseEnter(e);
                                    }}
                                    onMouseLeave={() => {
                                        handleMouseLeave();
                                        handleLikesMouseLeave();
                                    }}
                                    className={`flex items-center gap-1.5 group relative transition-colors ${liked ? 'text-[var(--cliq-pink)]' : 'text-[#8b86a6] hover:text-[var(--cliq-pink)]'}`}
                                >
                                    <div className={`p-2 rounded-full transition-colors ${liked ? 'bg-[var(--cliq-pink)]/10' : 'group-hover:bg-[var(--cliq-pink)]/10'}`}>
                                        <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    {likesCount > 0 && <span className="text-[13px] font-bold">{likesCount}</span>}
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'like' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Like
                                    </span>
                                </button>

                                <button
                                    onClick={toggleComments}
                                    onMouseEnter={() => handleMouseEnter('comments')}
                                    onMouseLeave={handleMouseLeave}
                                    className={`flex items-center gap-1.5 group relative transition-colors ${showComments ? 'text-[#8b5cf6]' : 'text-[#8b86a6] hover:text-[#8b5cf6]'}`}
                                >
                                    <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-[#8b5cf6]/10' : 'group-hover:bg-[#8b5cf6]/10'}`}>
                                        <MessageCircle size={20} fill={showComments ? "currentColor" : "none"} strokeWidth={showComments ? 0 : 2} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    {comments.length > 0 && <span className="text-[13px] font-bold">{comments.length}</span>}
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'comments' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Comments
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleActionClick("Remix is on a coffee break ☕", "funny")}
                                    onMouseEnter={() => handleMouseEnter('remix')}
                                    onMouseLeave={handleMouseLeave}
                                    className="flex items-center gap-1.5 group relative text-[#8b86a6] hover:text-[#10b981] transition-colors"
                                >
                                    <div className="p-2 rounded-full group-hover:bg-[#10b981]/10">
                                        <Repeat size={20} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="text-[13px] font-bold">18</span>
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'remix' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Remix
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleActionClick("This post is feeling a little too private 🤫", "funny")}
                                    onMouseEnter={() => handleMouseEnter('share')}
                                    onMouseLeave={handleMouseLeave}
                                    className="flex items-center group relative text-[#8b86a6] hover:text-[#8b5cf6] transition-colors"
                                >
                                    <div className="p-2 rounded-full group-hover:bg-[#8b5cf6]/10">
                                        <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'share' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Share
                                    </span>
                                </button>
                            </>
                        )}
                    </div>

                    {
                        showToast && (
                            <Toastbar
                                message={toastMessage}
                                type={toastType}
                                onClose={() => setShowToast(false)}
                            />
                        )
                    }
                </article >

                {showComments && (
                    <div ref={commentsRef} className="animate-slideDown">
                        {/* Comment Input */}
                        <div className="p-4 border-b border-white/[0.05] bg-transparent z-10 flex space-x-3 w-full relative">
                            <form onSubmit={handleAddComment} className="flex flex-1 items-start space-x-3 w-full">
                                <Link
                                    to="/profile"
                                    onMouseEnter={(e) => handleProfileMouseEnter(e, currentUser?.id)}
                                    onMouseLeave={handleProfileMouseLeave}
                                    className="shrink-0"
                                >
                                    <img src={currentUser?.imageUrl || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity" alt="Me" />
                                </Link>
                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Post your reply"
                                        className="w-full bg-transparent border-none px-0 py-2 text-[17px] text-white placeholder-[#8b86a6] focus:outline-none focus:ring-0 leading-relaxed"
                                    />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || isSubmittingComment}
                                            className="px-4 py-1.5 bg-[#8b5cf6] text-white rounded-full font-bold text-[14px] disabled:opacity-50 disabled:bg-[#8b5cf6]/50 transition-colors"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Comments List - Scrollable Area */}
                        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="p-4 flex space-x-3 hover:bg-white/[0.02] transition-colors">
                                        <Link
                                            to={currentUser?.id === comment.userId ? "/profile" : `/public-profile/${comment.userId}`}
                                            onMouseEnter={(e) => handleProfileMouseEnter(e, comment.userId)}
                                            onMouseLeave={handleProfileMouseLeave}
                                            className="shrink-0"
                                        >
                                            <img src={comment.avatar || "https://github.com/shadcn.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        </Link>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1.5">
                                                    <Link
                                                        to={currentUser?.id === comment.userId ? "/profile" : `/public-profile/${comment.userId}`}
                                                        className="font-bold text-[15px] text-white hover:underline transition-colors"
                                                        onMouseEnter={(e) => handleProfileMouseEnter(e, comment.userId)}
                                                        onMouseLeave={handleProfileMouseLeave}
                                                    >
                                                        {comment.username || "Anonymous"}
                                                    </Link>
                                                    <span className="text-[#8b86a6] text-[14px]">
                                                        @{comment.username?.replace(/\s+/g, '').toLowerCase() || "user"}
                                                    </span>
                                                    <span className="text-[#8b86a6] text-[14px]">·</span>
                                                    <span className="text-[#8b86a6] text-[14px] hover:underline cursor-pointer">
                                                        {new Date(comment.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                                    </span>
                                                </div>
                                                <div className="relative comment-menu-container">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                                                        className="text-[#8b86a6] hover:text-[#8b5cf6] p-1.5 hover:bg-[#8b5cf6]/10 rounded-full transition-colors"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {activeMenuId === comment.id && (
                                                        <div className="absolute right-0 mt-1 w-48 bg-[#0A0A0F] border border-white/5 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn">
                                                            {comment.userId === currentUser?.id ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setDeletingCommentId(comment.id);
                                                                        setShowDeleteConfirm(true);
                                                                        setActiveMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-white/5 transition-colors flex items-center space-x-3 font-bold"
                                                                >
                                                                    <Trash2 size={18} />
                                                                    <span>Delete reply</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={comment.isReported ? null : () => openReportModal('comment', comment.id)}
                                                                    disabled={comment.isReported}
                                                                    className={`w-full px-4 py-3 text-left text-sm flex items-center space-x-3 transition-colors font-bold ${comment.isReported ? 'text-gray-500 cursor-default' : 'text-white hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    <Flag size={18} className={comment.isReported ? 'text-gray-500' : 'text-white'} />
                                                                    <span>{comment.isReported ? 'Reported' : 'Report reply'}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[#ebe7f7] text-[15px] leading-relaxed block mt-0">{comment.comment}</p>
                                            <div className="flex items-center justify-between w-full max-w-[425px] pt-3 text-[#8b86a6]">
                                                <button className="flex items-center gap-2 group transition flex-1">
                                                    <div className="p-2 rounded-full group-hover:bg-[#8b5cf6]/10 group-hover:text-[#8b5cf6] transition-colors -ml-2">
                                                        <MessageCircle size={16} />
                                                    </div>
                                                </button>
                                                <button className="flex items-center gap-2 group transition flex-1">
                                                    <div className="p-2 rounded-full group-hover:bg-[var(--cliq-pink)]/10 group-hover:text-[var(--cliq-pink)] transition-colors -ml-2">
                                                        <Heart size={16} />
                                                    </div>
                                                </button>
                                                <button className="flex items-center gap-2 group transition flex-1">
                                                    <div className="p-2 rounded-full group-hover:bg-[#10b981]/10 group-hover:text-[#10b981] transition-colors -ml-2">
                                                        <Repeat size={16} />
                                                    </div>
                                                </button>
                                                <button className="flex items-center gap-2 group transition flex-1">
                                                    <div className="p-2 rounded-full group-hover:bg-[#8b5cf6]/10 group-hover:text-[#8b5cf6] transition-colors -ml-2">
                                                        <Share2 size={16} />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-[#8b86a6] text-[15px] font-bold">
                                    No replies yet. Be the first to answer!
                                </div>
                            )}
                        </div>
                    </div>
                )
                }
            </main >

            <Confirmation
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeletingCommentId(null);
                }}
                onConfirm={handleDeleteComment}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                confirmColor="bg-red-600 hover:bg-red-700"
                isLoading={isDeleting}
            />

            <ReportModal
                isOpen={showReportModal}
                onClose={closeReportModal}
                onReport={handleReportPost}
                isReporting={isReporting}
            />

            <Confirmation
                isOpen={showDeletePostConfirm}
                onClose={() => setShowDeletePostConfirm(false)}
                onConfirm={handleDeletePost}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete Post"
                confirmColor="bg-red-600 hover:bg-red-700"
                isLoading={isDeletingPost}
            />

            <ProfileHoverCard
                userId={hoverUserId}
                isVisible={showHoverCard}
                anchorRect={hoverAnchorRect}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
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
}

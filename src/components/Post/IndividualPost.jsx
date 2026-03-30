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

    const handleActionClick = (message) => {
        setToastMessage(message);
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
            setShowToast(true);
        } finally {
            setIsReporting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!post) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors"
            >
                Return Home
            </button>
        </div>
    );

    const isOwner = currentUser?.id === post.userId; // Changed user to currentUser

    return (
        <div ref={containerRef} className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative">

            {/* Header: Fixed at top to prevent jumping against Layout's constant pt-16 */}
            <header className="fixed top-0 left-0 md:left-28 right-0 h-16 z-50 bg-black/99 backdrop-blur-md border-b border-neutral-800 flex items-center px-4 transition-colors duration-300 shadow-xl">
                <div className="max-w-2xl mx-auto flex-1 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Post</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner ? (
                            <div className="flex space-x-2">
                                {!isEditing && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/post/${postId}/edit`)}
                                            className="p-2 hover:bg-white/10 rounded-full text-blue-400 transition-colors"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeletePostConfirm(true)}
                                            className="p-2 hover:bg-white/10 rounded-full text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="relative post-menu-container">
                                <button
                                    onClick={() => setShowPostMenu(!showPostMenu)}
                                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 flex items-center justify-center transition-colors"
                                >
                                    <MoreHorizontal size={24} />
                                </button>
                                {showPostMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                                        <button
                                            onClick={reportedPost ? null : () => openReportModal('post', postId)}
                                            disabled={reportedPost}
                                            className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${reportedPost
                                                ? 'text-gray-500 cursor-default'
                                                : 'text-red-500 hover:bg-white/5'
                                                }`}
                                        >
                                            <Flag size={18} className={reportedPost ? 'text-gray-500' : 'text-red-500'} />
                                            <span className="font-medium text-sm">{reportedPost ? 'Reported' : 'Report Post'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Spacer to account for fixed header */}
            <div className="h-16 w-full"></div>

            <main className="max-w-2xl mx-auto pb-24">
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
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                                <img
                                    src={post.avatar || "https://github.com/shadcn.png"}
                                    alt={post.username}
                                    className="relative w-12 h-12 rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                                    {post.username}
                                </h3>
                                <p className="text-gray-500 text-sm">@{post.username?.replace(/\s+/g, '').toLowerCase() || "user"}</p>
                            </div>
                        </Link>
                        {!isOwner && (
                            <button
                                onClick={handleFollow}
                                disabled={connectionStatus === 'accepted' || connectionStatus === 'interested'}
                                className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${connectionStatus === 'accepted'
                                    ? 'bg-transparent border-emerald-500/50 text-emerald-500 cursor-default'
                                    : connectionStatus === 'interested'
                                        ? 'bg-transparent border-white/20 text-white/60 cursor-default'
                                        : 'bg-white text-black border-transparent hover:bg-gray-200 shadow-lg shadow-white/10'
                                    }`}
                            >
                                {connectionStatus === 'accepted' ? 'Connected' : connectionStatus === 'interested' ? 'Requested' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
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
                                             border-color: transparent transparent #3b82f6 transparent;
                                        }
                                    `}
                                </style>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="custom-resize-handle w-full h-24 bg-[#111] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 resize-y text-xl leading-relaxed"
                                    placeholder="Edit your post content..."
                                />
                            </>
                        ) : (
                            <p className="text-xl leading-relaxed text-gray-100 whitespace-pre-wrap">
                                {post.content}
                            </p>
                        )}

                        {(post.image || post.video) && (
                            <div className="rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center w-full h-[500px] bg-[#121212] border border-white/10 mb-6">
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
                    </div>

                    {/* Interaction Buttons - Re-styled with counts, border-b, and tooltips */}
                    <div className="flex items-center justify-between px-2 py-4 border-y border-white/10">
                        {isEditing ? (
                            <div className="flex justify-end gap-3 w-full">
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isSavingEdit}
                                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSavingEdit}
                                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50"
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
                                    className={`flex items-center group relative transition-colors ${liked ? 'text-rose-500' : 'text-gray-500 md:hover:text-rose-500'}`}
                                >
                                    {likesCount > 0 && <span className="text-sm font-bold mr-1">{likesCount}</span>}
                                    <div className={`p-2 rounded-full transition-colors ${liked ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'}`}>
                                        <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={liked ? 0 : 2} />
                                    </div>
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'like' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Like
                                    </span>
                                </button>

                                <button
                                    onClick={toggleComments}
                                    onMouseEnter={() => handleMouseEnter('comments')}
                                    onMouseLeave={handleMouseLeave}
                                    className={`flex items-center group relative transition-colors ${showComments ? 'text-blue-500' : 'text-gray-500 md:hover:text-blue-500'}`}
                                >
                                    {comments.length > 0 && <span className="text-sm font-bold mr-1">{comments.length}</span>}
                                    <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-blue-500/10' : 'group-hover:bg-blue-500/10'}`}>
                                        <MessageCircle size={20} fill={showComments ? "currentColor" : "none"} strokeWidth={showComments ? 0 : 2} />
                                    </div>
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'comments' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Comments
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleActionClick("Remix is on a coffee break ☕")}
                                    onMouseEnter={() => handleMouseEnter('remix')}
                                    onMouseLeave={handleMouseLeave}
                                    className="flex items-center group relative text-gray-500 md:hover:text-emerald-500 transition-colors"
                                >
                                    <div className="p-2 rounded-full group-hover:bg-emerald-500/10">
                                        <Repeat size={20} />
                                    </div>
                                    {/* Tooltip */}
                                    <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-100 ${activeTooltip === 'remix' ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                        Remix
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleActionClick("This post is feeling a little too private 🤫")}
                                    onMouseEnter={() => handleMouseEnter('share')}
                                    onMouseLeave={handleMouseLeave}
                                    className="flex items-center group relative text-gray-500 md:hover:text-amber-500 transition-colors"
                                >
                                    <div className="p-2 rounded-full group-hover:bg-amber-500/10">
                                        <Share2 size={20} />
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
                                onClose={() => setShowToast(false)}
                            />
                        )
                    }
                </article >

                {showComments && (
                    <div ref={commentsRef} className="animate-slideDown">
                        {/* Comment Input */}
                        <div className="p-4 border-t border-white/10 bg-black/50 sticky bottom-0 backdrop-blur-sm z-10">
                            <form onSubmit={handleAddComment} className="flex items-center space-x-3">
                                <Link
                                    to="/profile"
                                    onMouseEnter={(e) => handleProfileMouseEnter(e, currentUser?.id)}
                                    onMouseLeave={handleProfileMouseLeave}
                                >
                                    <img src={currentUser?.imageUrl || "https://github.com/shadcn.png"} className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity" alt="Me" />
                                </Link>
                                <div className="flex-1 relative">
                                    <input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Post your reply"
                                        className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmittingComment}
                                        className="absolute right-2 top-1.5 p-1 text-emerald-500 disabled:opacity-50 disabled:text-gray-500"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Comments List - Scrollable Area */}
                        <div className="divide-y divide-white/5 bg-black/20 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="p-4 flex space-x-3 hover:bg-white/[0.02] transition-colors">
                                        <Link
                                            to={currentUser?.id === comment.userId ? "/profile" : `/public-profile/${comment.userId}`}
                                            onMouseEnter={(e) => handleProfileMouseEnter(e, comment.userId)}
                                            onMouseLeave={handleProfileMouseLeave}
                                        >
                                            <img src={comment.avatar || "https://github.com/shadcn.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        </Link>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={currentUser?.id === comment.userId ? "/profile" : `/public-profile/${comment.userId}`}
                                                        className="font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                                                        onMouseEnter={(e) => handleProfileMouseEnter(e, comment.userId)}
                                                        onMouseLeave={handleProfileMouseLeave}
                                                    >
                                                        {comment.username || "Anonymous"}
                                                    </Link>
                                                    <span className="text-gray-500 text-xs">·</span>
                                                    <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="relative comment-menu-container">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                                                        className="text-gray-600 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>

                                                    {activeMenuId === comment.id && (
                                                        <div className="absolute right-0 mt-1 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn">
                                                            {comment.userId === currentUser?.id ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setDeletingCommentId(comment.id);
                                                                        setShowDeleteConfirm(true);
                                                                        setActiveMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-white/5 transition-colors flex items-center space-x-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Delete</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={comment.isReported ? null : () => openReportModal('comment', comment.id)}
                                                                    disabled={comment.isReported}
                                                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center space-x-2 transition-colors ${comment.isReported ? 'text-gray-500 cursor-default' : 'text-gray-400 hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    <Flag size={14} className={comment.isReported ? 'text-gray-500' : 'text-gray-400'} />
                                                                    <span>{comment.isReported ? 'Reported' : 'Report'}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed">{comment.comment}</p>
                                            <div className="flex items-center space-x-6 pt-2 text-gray-500">
                                                <button className="hover:text-rose-500 transition-colors"><Heart size={14} /></button>
                                                <button className="hover:text-blue-500 transition-colors"><MessageCircle size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-500 text-sm">
                                    No comments yet. Be the first to reply!
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

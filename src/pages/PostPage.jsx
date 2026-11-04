import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import * as postsApi from "../api/posts";
import { useUserContext } from "../context/UserContext";
import { useFeedContext } from "../context/FeedContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Toastbar from "../components/chat/Toastbar";
import ReportModal from "../components/posts/ReportModal";
import ProfileHoverCard from "../components/profile/ProfileHoverCard";
import LikesHoverCard from "../components/posts/LikesHoverCard";
import PostDetailNotFound from "../components/posts/PostDetailNotFound";
import PostDetailBackdrop from "../components/posts/PostDetailBackdrop";
import PostDetailTopBar from "../components/posts/PostDetailTopBar";
import PostDetailAuthorRow from "../components/posts/PostDetailAuthorRow";
import PostDetailContent from "../components/posts/PostDetailContent";
import PostDetailActionBar from "../components/posts/PostDetailActionBar";
import PostDetailCommentSection from "../components/posts/PostDetailCommentSection";
import { usePostActions } from "../hooks/usePostActions";
import { usePostDetailHoverCards } from "../hooks/usePostDetailHoverCards";
import { usePostDetailCommentsVisibility } from "../hooks/usePostDetailCommentsVisibility";
import { usePostDetailConnection } from "../hooks/usePostDetailConnection";
import { usePostDetailComments } from "../hooks/usePostDetailComments";
import { usePostDetailReport } from "../hooks/usePostDetailReport";

import IndividualPostShimmering from "../components/shimmering/IndividualPostShimmering";
import { likesCountAfterToggle } from "../utils/postLikes";
import { showErrorToast } from "../utils/toast";

export default function PostPage() {
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
    const likingRef = useRef(false);
    const {
        comments,
        setComments,
        newComment,
        setNewComment,
        setNewCommentMentionIds,
        isSubmittingComment,
        showDeleteConfirm,
        isDeleting,
        handleAddComment,
        handleSubmitReply,
        handleDeleteComment,
        requestDeleteComment,
        cancelDeleteComment,
    } = usePostDetailComments({ postId, setPost, updateFeedPost });
    const [editMentionIds, setEditMentionIds] = useState([]);
    const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const isEditing = location.pathname.endsWith("/edit");
    const [editContent, setEditContent] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("info");

    // Profile / likes hover cards and action tooltips (also clears their timers on unmount)
    const hover = usePostDetailHoverCards(containerRef);

    const { showComments, commentsRef, toggleComments } = usePostDetailCommentsVisibility({
        loading,
        searchParams,
        setSearchParams,
    });

    const {
        showReportModal,
        isReporting,
        reportedPost,
        setReportedPost,
        openReportModal,
        closeReportModal,
        handleReportPost,
    } = usePostDetailReport({
        postId,
        searchParams,
        setSearchParams,
        setShowPostMenu,
        setActiveMenuId,
        setComments,
        setToastMessage,
        setToastType,
        setShowToast,
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId && !event.target.closest(".comment-menu-container")) {
                setActiveMenuId(null);
            }
            if (showPostMenu && !event.target.closest(".post-menu-container")) {
                setShowPostMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeMenuId, showPostMenu]);

    useEffect(() => {
        if (!postId || postId === "undefined") {
            setLoading(false);
            return;
        }

        if (isEditing && post) {
            setEditContent(post.content || "");
        }
    }, [isEditing, post, postId]);

    const { connectionStatus, handleFollow } = usePostDetailConnection({
        post,
        currentUserId: currentUser?.id,
        setToastMessage,
        setShowToast,
    });

    useEffect(() => {
        if (!postId || postId === "undefined") {
            setLoading(false);
            return;
        }

        const controller = new AbortController(); // responses for a previous postId are dropped
        const { signal } = controller;
        // Opening another post from this page (an embedded/quoted post): show the skeleton, not the old post
        if (post && post.id !== postId) setLoading(true);

        const fetchPostAndComments = async () => {
            try {
                // The post and its comments load in parallel (the comments used to wait for the post)
                const commentsRequest = postsApi.getPostComments(postId, { signal });
                commentsRequest.catch(() => {}); // handled below; never an unhandled rejection on the repost redirect
                const fetched = await postsApi.getPost(postId, { signal });
                const postData = Array.isArray(fetched) ? fetched[0] : fetched;
                // A plain repost has nothing of its own to show; open the original.
                if (postData.isRepost && !postData.isQuote && postData.repostOf) {
                    navigate(`/post/${postData.repostOf.id}`, { replace: true });
                    return;
                }
                setPost(postData);
                setLikesCount(postData.likes || 0);
                setLiked(postData.isLiked || false);
                setReportedPost(postData.isReported || false);

                if (isEditing) {
                    setEditContent(postData.content || "");
                }

                try {
                    const postComments = await commentsRequest;
                    setComments(postComments || []);
                } catch (error) {
                    if (signal.aborted) return;
                    // The post itself loaded: show it without comments rather than "post not found"
                    console.error("Error fetching comments:", error);
                    setComments([]);
                }
            } catch (error) {
                if (signal.aborted) return;
                console.error("Error fetching post data:", error);
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };

        if (location.state?.focusComments) {
            setSearchParams({ comment: "true" });
        }

        fetchPostAndComments();
        return () => controller.abort();
        // Refetch only when the post (or the navigation that opened it) changes; isEditing is read just to prefill
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, location.state]);

    const handleDeletePost = async () => {
        setIsDeletingPost(true);
        try {
            await postsApi.deletePost(postId, { silent: true });
            navigate("/profile");
        } catch (error) {
            console.error("Delete failed:", error);
            showErrorToast(error.response?.data?.message || "Failed to delete post.");
        } finally {
            setIsDeletingPost(false);
            setShowDeletePostConfirm(false);
        }
    };

    const handleSaveEdit = async () => {
        // The server requires text on an edited post (even one with a photo or video)
        if (!editContent.trim()) {
            showErrorToast("Write something before saving.");
            return;
        }
        setIsSavingEdit(true);
        try {
            const data = await postsApi.updatePost(
                postId,
                { content: editContent, mentionIds: editMentionIds },
                { silent: true },
            );
            // The server re-derives mentions and the link preview from the new text.
            const { content, mentions, linkPreview, hashtags } = data.updatedPost || {};
            setPost((prev) => ({ ...prev, content, mentions, linkPreview, hashtags }));
            updateFeedPost(postId, { content, mentions, linkPreview, hashtags });
            navigate(`/post/${postId}`, { replace: true });
        } catch (error) {
            console.error("Update failed:", error);
            showErrorToast(error.response?.data?.message || "Failed to update post.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setEditContent(post.content);
        navigate(`/post/${postId}`, { replace: true });
    };

    const toggleLike = async () => {
        // A second click while the first toggle is in flight would race it (responses can arrive out of order)
        if (likingRef.current) return;
        likingRef.current = true;
        const previousLiked = liked;
        const previousCount = likesCount;

        // Optimistic UI update
        setLiked(!liked);
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

        try {
            const like = await postsApi.togglePostLike(postId);
            // Sync with the server's answer; the count follows from it (no second request)
            const nextCount = likesCountAfterToggle(previousLiked, previousCount, like.isLiked);
            setLiked(like.isLiked);
            setLikesCount(nextCount);
            updateFeedPost(postId, { isLiked: like.isLiked, likes: nextCount });
        } catch (error) {
            console.error("Error toggling like:", error);
            // Rollback on error
            setLiked(previousLiked);
            setLikesCount(previousCount);
        } finally {
            likingRef.current = false;
        }
    };

    const handleActionClick = (message, type = "info") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const actions = usePostActions(post, handleActionClick);

    if (loading) return <IndividualPostShimmering />;

    if (!post) return <PostDetailNotFound />;

    const isOwner = currentUser?.id === post.userId;

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-surface-900 text-white relative overflow-x-hidden no-scrollbar"
        >
            <PostDetailBackdrop />

            <main className="max-w-[640px] mx-auto pt-6 md:pt-10 pb-24 relative z-10">
                {/* Integrated Navigation Row */}
                <PostDetailTopBar
                    postId={postId}
                    isOwner={isOwner}
                    isEditing={isEditing}
                    showPostMenu={showPostMenu}
                    onTogglePostMenu={() => setShowPostMenu(!showPostMenu)}
                    reportedPost={reportedPost}
                    onReportPost={() => openReportModal("post", postId)}
                    onDeletePost={() => setShowDeletePostConfirm(true)}
                />

                {/* Post Body */}
                <article className="px-4 py-2 space-y-3 motion-safe:animate-[fadeIn_var(--cliq-dur-page)_var(--cliq-ease)]">
                    {/* User Profile Info */}
                    <PostDetailAuthorRow
                        post={post}
                        currentUserId={currentUser?.id}
                        isOwner={isOwner}
                        connectionStatus={connectionStatus}
                        onFollow={handleFollow}
                        onProfileMouseEnter={hover.handleProfileMouseEnter}
                        onProfileMouseLeave={hover.handleProfileMouseLeave}
                    />

                    {/* Content */}
                    <PostDetailContent
                        post={post}
                        currentUserId={currentUser?.id}
                        isEditing={isEditing}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onEditMentionIdsChange={setEditMentionIds}
                    />

                    {/* Interaction Buttons - Re-styled with counts, border-b, and tooltips */}
                    <PostDetailActionBar
                        post={post}
                        actions={actions}
                        currentUserId={currentUser?.id}
                        isEditing={isEditing}
                        isSavingEdit={isSavingEdit}
                        onCancelEdit={handleCancelEdit}
                        onSaveEdit={handleSaveEdit}
                        liked={liked}
                        likesCount={likesCount}
                        onToggleLike={toggleLike}
                        showComments={showComments}
                        onToggleComments={toggleComments}
                        activeTooltip={hover.activeTooltip}
                        onTooltipEnter={hover.handleMouseEnter}
                        onTooltipLeave={hover.handleMouseLeave}
                        onLikesMouseEnter={hover.handleLikesMouseEnter}
                        onLikesMouseLeave={hover.handleLikesMouseLeave}
                    />

                    {showToast && (
                        <Toastbar message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
                    )}
                </article>

                {showComments && (
                    <PostDetailCommentSection
                        commentsRef={commentsRef}
                        currentUser={currentUser}
                        comments={comments}
                        newComment={newComment}
                        onNewCommentChange={setNewComment}
                        onNewCommentMentionIdsChange={setNewCommentMentionIds}
                        isSubmittingComment={isSubmittingComment}
                        onAddComment={handleAddComment}
                        onSubmitReply={handleSubmitReply}
                        onDeleteComment={requestDeleteComment}
                        onReportComment={(c) => openReportModal("comment", c.id)}
                        onProfileMouseEnter={hover.handleProfileMouseEnter}
                        onProfileMouseLeave={hover.handleProfileMouseLeave}
                    />
                )}
            </main>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={cancelDeleteComment}
                onConfirm={handleDeleteComment}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? Replies to it will be deleted too. This action cannot be undone."
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

            <ConfirmDialog
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
                userId={hover.hoverUserId}
                isVisible={hover.showHoverCard}
                anchorRect={hover.hoverAnchorRect}
                onMouseEnter={hover.handleCardMouseEnter}
                onMouseLeave={hover.handleCardMouseLeave}
            />

            <LikesHoverCard
                postId={post.id}
                isVisible={hover.showLikesHover}
                anchorRect={hover.likesAnchorRect}
                onMouseEnter={hover.handleLikesCardMouseEnter}
                onMouseLeave={hover.handleLikesCardMouseLeave}
            />
        </div>
    );
}

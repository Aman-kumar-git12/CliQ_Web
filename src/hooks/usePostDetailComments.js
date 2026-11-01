/** Post detail page: comment list state plus add / reply / delete handlers (keeps post + feed counts in sync). */
import { useState } from "react";
import * as postsApi from "../api/posts";

export function usePostDetailComments({ postId, setPost, updateFeedPost }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [newCommentMentionIds, setNewCommentMentionIds] = useState([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const created = await postsApi.addComment(postId, {
                comment: newComment,
                mentionIds: newCommentMentionIds,
            });

            setComments((prev) => [created, ...prev]);
            setNewComment("");

            // Update local post state
            setPost((prev) => ({ ...prev, comments: (prev.comments || 0) + 1 }));

            // Sync with global feed (Incremental)
            updateFeedPost(postId, (p) => ({ comments: (p.comments || 0) + 1 }));
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // `parent` may be a reply; the server files it under the top-level comment.
    const handleSubmitReply = async (parent, text, mentionIds) => {
        const reply = await postsApi.addComment(postId, {
            comment: text,
            parentId: parent.id,
            mentionIds,
        });
        const threadId = reply.parentId;
        setComments((prev) =>
            prev.map((c) =>
                c.id === threadId
                    ? { ...c, replies: [...(c.replies || []), reply], repliesCount: (c.repliesCount || 0) + 1 }
                    : c,
            ),
        );
        setPost((prev) => ({ ...prev, comments: (prev.comments || 0) + 1 }));
        updateFeedPost(postId, (p) => ({ comments: (p.comments || 0) + 1 }));
    };

    const handleDeleteComment = async () => {
        if (!deletingCommentId || isDeleting) return;

        setIsDeleting(true);
        try {
            const data = await postsApi.deleteComment(deletingCommentId);
            // Deleting a top-level comment also deletes its replies.
            const removed = data?.deletedCount || 1;
            setComments((prev) =>
                prev
                    .filter((c) => c.id !== deletingCommentId)
                    .map((c) => {
                        const replies = (c.replies || []).filter((r) => r.id !== deletingCommentId);
                        return replies.length === (c.replies || []).length
                            ? c
                            : { ...c, replies, repliesCount: replies.length };
                    }),
            );
            setShowDeleteConfirm(false);
            setDeletingCommentId(null);

            setPost((prev) => ({ ...prev, comments: Math.max(0, (prev.comments || 0) - removed) }));
            updateFeedPost(postId, (p) => ({ comments: Math.max(0, (p.comments || 0) - removed) }));
        } catch (error) {
            console.error("Error deleting comment:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const requestDeleteComment = (c) => {
        setDeletingCommentId(c.id);
        setShowDeleteConfirm(true);
    };

    const cancelDeleteComment = () => {
        setShowDeleteConfirm(false);
        setDeletingCommentId(null);
    };

    return {
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
    };
}

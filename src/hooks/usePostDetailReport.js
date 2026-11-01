/** Post detail page: report modal for the post (synced with `?report=`) or a comment, and the report submission. */
import { useState, useEffect } from "react";
import * as postsApi from "../api/posts";

export function usePostDetailReport({
    postId,
    searchParams,
    setSearchParams,
    setShowPostMenu,
    setActiveMenuId,
    setComments,
    setToastMessage,
    setToastType,
    setShowToast,
}) {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState({ type: "post", id: null });
    const [isReporting, setIsReporting] = useState(false);
    const [reportedPost, setReportedPost] = useState(false);

    // sync showReportModal with URL query param
    useEffect(() => {
        const reportParam = searchParams.get("report");
        if (reportParam === "true") {
            setReportTarget({ type: "post", id: postId });
            setShowReportModal(true);
        } else {
            setShowReportModal(false);
        }
    }, [searchParams, postId]);

    const openReportModal = (type, id) => {
        if (type === "post") {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("report", "true");
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
        newParams.delete("report");
        setSearchParams(newParams);
        setShowReportModal(false);
    };

    const handleReportPost = async (reason) => {
        setIsReporting(true);
        try {
            if (reportTarget.type === "post") await postsApi.reportPost(postId, reason, { silent: true });
            else await postsApi.reportComment(reportTarget.id, reason, { silent: true });
            setToastMessage(`${reportTarget.type === "post" ? "Post" : "Comment"} reported successfully 🫡`);
            setToastType("success");
            setShowToast(true);
            closeReportModal();

            if (reportTarget.type === "post") {
                setReportedPost(true);
            } else {
                const mark = (c) => (c.id === reportTarget.id ? { ...c, isReported: true } : c);
                setComments((prev) => prev.map((c) => ({ ...mark(c), replies: (c.replies || []).map(mark) })));
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

    return {
        showReportModal,
        isReporting,
        reportedPost,
        setReportedPost,
        openReportModal,
        closeReportModal,
        handleReportPost,
    };
}

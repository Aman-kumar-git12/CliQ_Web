import { useState, useEffect, useRef } from "react";
import axiosClient from "../api/axiosClient";
import { useFeedContext } from "../context/FeedContext";
import { useUserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export const usePostcard = (post) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { updateFeedPost } = useFeedContext();
    const { user: currentUser } = useUserContext();

    const [liked, setLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likes || 0);
    const [isLiking, setIsLiking] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reported, setReported] = useState(post?.isReported || false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipTimeoutRef = useRef(null);

    // Hover Card States
    const [hoverUserId, setHoverUserId] = useState(null);
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const [showCommentsHover, setShowCommentsHover] = useState(false);
    const [commentsAnchorRect, setCommentsAnchorRect] = useState(null);
    const commentsHoverTimeoutRef = useRef(null);

    const [showLikesHover, setShowLikesHover] = useState(false);
    const [likesAnchorRect, setLikesAnchorRect] = useState(null);
    const likesHoverTimeoutRef = useRef(null);

    // Sync local state with props
    useEffect(() => {
        setLiked(post?.isLiked || false);
        setLikesCount(post?.likes || 0);
        setReported(post?.isReported || false);
    }, [post]);

    // Outside click for menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && !event.target.closest('.post-menu-container')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // Handlers
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
        hoverTimeoutRef.current = setTimeout(() => setShowHoverCard(false), 200);
    };

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

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
        commentsHoverTimeoutRef.current = setTimeout(() => setShowCommentsHover(false), 200);
    };

    const handleCommentsCardMouseEnter = () => {
        if (commentsHoverTimeoutRef.current) clearTimeout(commentsHoverTimeoutRef.current);
    };

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
        likesHoverTimeoutRef.current = setTimeout(() => setShowLikesHover(false), 200);
    };

    const handleLikesCardMouseEnter = () => {
        if (likesHoverTimeoutRef.current) clearTimeout(likesHoverTimeoutRef.current);
    };

    const handleMouseEnterTooltip = (type) => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        setActiveTooltip(type);
        tooltipTimeoutRef.current = setTimeout(() => setActiveTooltip(null), 1500);
    };

    const handleMouseLeaveTooltip = () => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        setActiveTooltip(null);
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLiking) return;

        const previousLiked = liked;
        const previousCount = likesCount;

        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
        setIsLiking(true);

        try {
            const res = await axiosClient.post(`/user/post/like/${post.id}`, {}, { withCredentials: true });
            setLiked(res.data.isLiked);
            const countRes = await axiosClient.get(`/user/post/likes/count/${post.id}`, { withCredentials: true });
            setLikesCount(countRes.data.likesCount);
            updateFeedPost(post.id, (p) => ({
                isLiked: res.data.isLiked,
                likes: countRes.data.likesCount
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
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

    return {
        liked, likesCount, isLiking, showToast, setShowToast, toastMessage, showMenu, setShowMenu,
        showReportModal, setShowReportModal, isReporting, reported, activeTooltip,
        hoverUserId, showHoverCard, hoverAnchorRect,
        showCommentsHover, commentsAnchorRect,
        showLikesHover, likesAnchorRect,
        containerRef, currentUser, navigate, 
        
        handleProfileMouseEnter, handleProfileMouseLeave, handleCardMouseEnter,
        handleCommentsMouseEnter, handleCommentsMouseLeave, handleCommentsCardMouseEnter,
        handleLikesMouseEnter, handleLikesMouseLeave, handleLikesCardMouseEnter,
        handleMouseEnterTooltip, handleMouseLeaveTooltip,
        handleLike, handleActionClick, handleReportPost
    };
};

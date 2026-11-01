/** Post detail page: profile hover card, likes hover card and action-button tooltip state/handlers. */
import { useState, useEffect, useRef } from "react";

export function usePostDetailHoverCards(containerRef) {
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
                width: rect.width,
                height: rect.height,
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
                height: rect.height,
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

    // Pending hover/tooltip timers must not fire after the page unmounts
    useEffect(
        () => () => {
            clearTimeout(hoverTimeoutRef.current);
            clearTimeout(likesHoverTimeoutRef.current);
            clearTimeout(tooltipTimeoutRef.current);
        },
        [],
    );

    return {
        activeTooltip,
        handleMouseEnter,
        handleMouseLeave,
        hoverUserId,
        showHoverCard,
        hoverAnchorRect,
        handleProfileMouseEnter,
        handleProfileMouseLeave,
        handleCardMouseEnter,
        handleCardMouseLeave,
        showLikesHover,
        likesAnchorRect,
        handleLikesMouseEnter,
        handleLikesMouseLeave,
        handleLikesCardMouseEnter,
        handleLikesCardMouseLeave,
    };
}

/** Post detail page: comments panel open state, synced with the `?comment=` query param, plus scroll behaviour. */
import { useState, useEffect, useRef } from "react";

export function usePostDetailCommentsVisibility({ loading, searchParams, setSearchParams }) {
    const [showComments, setShowComments] = useState(false);
    const commentsRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        let scrollTimer;
        if (!loading && showComments && commentsRef.current) {
            // Wait for animation to start
            scrollTimer = setTimeout(() => {
                commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } else if (!loading && !showComments && !isFirstRender.current) {
            // Scroll to top smoothly when comments are closed, but not on initial load
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (!loading && isFirstRender.current) {
            isFirstRender.current = false;
        }
        return () => clearTimeout(scrollTimer);
    }, [showComments, loading]);

    // sync showComments with URL query param
    useEffect(() => {
        const commentParam = searchParams.get("comment");
        if (commentParam === "true") {
            setShowComments(true);
        } else if (commentParam === "false" || !commentParam) {
            setShowComments(false);
        }
    }, [searchParams]);

    const toggleComments = () => {
        const nextState = !showComments;
        // Update URL first, let the useEffect handle the state
        const newParams = new URLSearchParams(searchParams);
        if (nextState) {
            newParams.set("comment", "true");
        } else {
            newParams.delete("comment");
        }
        setSearchParams(newParams);
    };

    return { showComments, commentsRef, toggleComments };
}

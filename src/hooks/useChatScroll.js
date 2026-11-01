/** Chat page scrolling: refs for the message list and its end marker, the initial jump to the latest message. */
import { useEffect, useRef, useState } from "react";

export const useChatScroll = ({ loading, messagesLength, targetuserId }) => {
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = (behavior = "smooth") => {
        if (!scrollContainerRef.current || !messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    };

    // Initial Scroll Logic
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
    useEffect(() => {
        if (!loading && !hasInitialScrolled) {
            if (messagesLength > 0) {
                // Aggressive scroll to handle delayed DOM rendering and image loading
                let attempts = 0;
                const scrollInterval = setInterval(() => {
                    scrollToBottom("auto");
                    attempts++;
                    if (attempts >= 15) {
                        // Try for 750ms (15 * 50ms)
                        clearInterval(scrollInterval);
                        setHasInitialScrolled(true);
                    }
                }, 50);

                return () => clearInterval(scrollInterval);
            } else {
                setHasInitialScrolled(true);
            }
        }
    }, [loading, hasInitialScrolled, messagesLength]);

    useEffect(() => {
        setHasInitialScrolled(false);
    }, [targetuserId]);

    return { scrollContainerRef, messagesEndRef, scrollToBottom };
};

export default useChatScroll;

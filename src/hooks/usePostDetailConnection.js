/** Post detail page: connection status with the post author and the Follow action. */
import { useState, useEffect } from "react";
import * as connectionsApi from "../api/connections";
import { invalidateCachedRequests } from "../utils/requestCache";

export function usePostDetailConnection({ post, currentUserId, setToastMessage, setShowToast }) {
    // Check connection status
    const [connectionStatus, setConnectionStatus] = useState("none");

    const postAuthorId = post?.userId;

    useEffect(() => {
        if (!postAuthorId || !currentUserId || postAuthorId === currentUserId) return undefined;
        const controller = new AbortController(); // a late status for a previous post's author is dropped
        const checkConnection = async () => {
            try {
                const data = await connectionsApi.getConnectionStatus(postAuthorId, { signal: controller.signal });
                setConnectionStatus(data.status);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Error checking connection status:", error);
            }
        };
        checkConnection();
        return () => controller.abort();
    }, [postAuthorId, currentUserId]);

    const handleFollow = async () => {
        if (!post?.userId) return;

        try {
            await connectionsApi.sendConnectionRequest(post.userId, "interested", {}, { silent: true });
            setConnectionStatus("interested");
            invalidateCachedRequests(`hover-card:${post.userId}`);
            setToastMessage("Follow request sent 🚀");
            setShowToast(true);
        } catch (error) {
            console.error("Error sending follow request:", error);
            setToastMessage("Failed to send request ❌");
            setShowToast(true);
        }
    };

    return { connectionStatus, handleFollow };
}

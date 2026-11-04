/** Actions on the active smart-connection card: ignore, interested, (not) preferred and save for later. */
import { useState } from "react";
import { animate } from "framer-motion";
import { EASE_SOFT } from "../components/common/motionPresets";
import * as connectionsApi from "../api/connections";

/**
 * @param {object} args
 * @param {object|null} args.user the active card's user
 * @param {boolean} args.sending
 * @param {Function} args.setSending
 * @param {import("framer-motion").MotionValue<number>} args.dragX
 * @param {(msg: string) => void} args.showSnack
 * @param {Function} args.advanceToNextUser
 * @param {Function} args.refreshInsights
 * @param {Function} args.fetchPreferences
 * @param {Function} args.fetchSavedProfiles
 * @param {Function} args.fetchHistory
 * @param {Set<string>} args.savedCandidateIds
 */
export const useConnectionCardActions = ({
    user,
    sending,
    setSending,
    dragX,
    showSnack,
    advanceToNextUser,
    refreshInsights,
    fetchPreferences,
    fetchSavedProfiles,
    fetchHistory,
    savedCandidateIds,
}) => {
    const [savingProfile, setSavingProfile] = useState(false);

    const handleIgnore = async () => {
        if (!user || sending) return;
        setSending(true);
        const currentUserId = user.id;

        await animate(dragX, -800, { duration: 0.3, ease: EASE_SOFT });

        // Let next card mount instantly
        showSnack("User ignored");
        advanceToNextUser();
        setSending(false);

        // Fire API independently
        try {
            await connectionsApi.sendConnectionRequest(currentUserId, "ignored", { source: "smart_connections" });
            refreshInsights();
        } catch (err) {
            console.error("Failed to ignore:", err);
            // Even if it fails (like 409 conflict), still refresh insights so the UI stays in sync
            refreshInsights();
        }
    };

    const handleInterested = async () => {
        if (!user || sending) return;
        setSending(true);
        const currentUserId = user.id;

        await animate(dragX, 800, { duration: 0.3, ease: EASE_SOFT });

        // Let next card mount instantly
        showSnack("Request sent");
        advanceToNextUser();
        setSending(false);

        // Fire API independently
        try {
            await connectionsApi.sendConnectionRequest(currentUserId, "interested", { source: "smart_connections" });
            refreshInsights();
        } catch (err) {
            console.error("Failed to send interest:", err);
            if (err.response && err.response.status === 409) {
                // Ignore 409 silently, they already sent a request
                refreshInsights();
            }
        }
    };

    const handleMarkPreferred = async () => {
        if (!user || sending) return;
        setSending(true);
        try {
            const data = await connectionsApi.markPreferred(user.id, { source: "smart_connections" });
            showSnack(data?.message || "Marked as Preferred");
            fetchPreferences({ silent: true });
        } catch (err) {
            console.error("Failed to mark preferred:", err);
        } finally {
            setSending(false);
        }
    };

    const handleMarkNotPreferred = async () => {
        if (!user || sending) return;
        setSending(true);
        try {
            const data = await connectionsApi.markNotPreferred(user.id, { source: "smart_connections" });
            showSnack(data?.message || "Marked as Not Preferred");
            fetchPreferences({ silent: true });
        } catch (err) {
            console.error("Failed to mark not preferred:", err);
        } finally {
            setSending(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || savingProfile) return;
        setSavingProfile(true);
        try {
            await connectionsApi.saveProfile(user.id, { source: "smart_connections" }, { silent: true });
            showSnack(savedCandidateIds.has(user.id) ? "Already saved" : "Saved for later");
            fetchSavedProfiles({ silent: true });
            fetchHistory({ silent: true });
        } catch (err) {
            console.error("Failed to save profile:", err);
            showSnack("Failed to save");
        } finally {
            setSavingProfile(false);
        }
    };

    return {
        savingProfile,
        handleIgnore,
        handleInterested,
        handleMarkPreferred,
        handleMarkNotPreferred,
        handleSaveProfile,
    };
};

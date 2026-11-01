/** Actions on the saved / history / preference lists of the smart-connections panels. */
import { useState } from "react";
import * as connectionsApi from "../api/connections";

/**
 * @param {object} args
 * @param {(msg: string) => void} args.showSnack
 * @param {Function} args.setSavedProfiles
 * @param {Function} args.fetchSavedProfiles
 * @param {Function} args.refreshInsights
 * @param {Function} args.setSelectedSection
 */
export const useConnectionListActions = ({
    showSnack,
    setSavedProfiles,
    fetchSavedProfiles,
    refreshInsights,
    setSelectedSection,
}) => {
    const [actionInProgress, setActionInProgress] = useState(new Set());

    const handleRemoveSaved = async (candidateUserId) => {
        setSavedProfiles((prev) => prev.filter((item) => (item.candidate?.id || item.id) !== candidateUserId));
        try {
            await connectionsApi.removeSavedProfile(candidateUserId, { silent: true });
            showSnack("Removed from saved");
            fetchSavedProfiles({ silent: true });
        } catch (err) {
            console.error("Failed to remove saved:", err);
            showSnack("Failed to remove from saved");
            fetchSavedProfiles({ silent: true });
        }
    };

    const handleSendFromSaved = async (candidateUserId) => {
        setSavedProfiles((prev) => prev.filter((item) => (item.candidate?.id || item.id) !== candidateUserId));
        try {
            await connectionsApi.sendConnectionRequest(
                candidateUserId,
                "interested",
                { source: "saved_recommendations" },
                { silent: true },
            );
            await connectionsApi.removeSavedProfile(candidateUserId, { silent: true });
            showSnack("Request sent");
            refreshInsights();
        } catch (err) {
            console.error("Failed to send from saved:", err);
            showSnack("Failed to send request");
            fetchSavedProfiles({ silent: true });
        }
    };

    const handleResetSection = async (section) => {
        try {
            await connectionsApi.resetHistorySection(section, { silent: true });
            showSnack("Section reset");
            setSelectedSection(null);
            refreshInsights();
        } catch (err) {
            console.error("Failed to reset section:", err);
            showSnack("Failed to reset section");
        }
    };

    const handleActionFromList = async (targetAction, candidateUserId) => {
        if (actionInProgress.has(candidateUserId)) return;
        setActionInProgress((prev) => new Set(prev).add(candidateUserId));
        try {
            const mark = targetAction === "preferred" ? connectionsApi.markPreferred : connectionsApi.markNotPreferred;
            await mark(candidateUserId, { source: "list_action" }, { silent: true });
            showSnack(`Moved to ${targetAction === "preferred" ? "Preferred" : "Not Preferred"}`);
            refreshInsights();
        } catch (err) {
            console.error(`Failed to move to ${targetAction}:`, err);
            showSnack("Action failed");
        } finally {
            setActionInProgress((prev) => {
                const updated = new Set(prev);
                updated.delete(candidateUserId);
                return updated;
            });
        }
    };

    const handleRemoveSectionItem = async (action, candidateUserId) => {
        try {
            await connectionsApi.removeHistorySectionItem(action, candidateUserId, { silent: true });
            showSnack("Item removed");
            refreshInsights();
        } catch (err) {
            console.error(`Failed to remove item:`, err);
            showSnack("Failed to update list");
        }
    };

    return {
        actionInProgress,
        handleRemoveSaved,
        handleSendFromSaved,
        handleResetSection,
        handleActionFromList,
        handleRemoveSectionItem,
    };
};

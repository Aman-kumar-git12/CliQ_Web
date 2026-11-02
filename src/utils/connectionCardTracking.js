// @ts-check
/** Reports a smart-connection card as shown (background analytics, never toasts). */
import * as connectionsApi from "../api/connections";

/** @param {import("../api/connections").SmartCandidate} activeUser */
export const reportSmartCardShown = (activeUser) =>
    connectionsApi.trackProfileShown(
        activeUser.id,
        {
            source: "smart_connections",
            metadata: {
                delivery: "active_card",
                matchScore: activeUser.matchScore,
                matchConfidence: activeUser.matchConfidence,
                profileQualityScore: activeUser.profileQualityScore,
                profileQualityLabel: activeUser.profileQualityLabel,
                selectionMode: activeUser.selectionMode,
                diversity: activeUser.diversity || null,
            },
        },
        { silent: true },
    ); // background tracking: never worth a toast

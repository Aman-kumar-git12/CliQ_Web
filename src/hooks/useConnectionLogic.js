import { useState, useEffect, useRef, useMemo } from "react";
import * as usersApi from "../api/users";
import { useUserContext } from "../context/UserContext";
import { useConnectionCardMotion } from "./useConnectionCardMotion";
import { useConnectionInsights } from "./useConnectionInsights";
import { useConnectionListActions } from "./useConnectionListActions";
import { useConnectionCardActions } from "./useConnectionCardActions";
import { useConnectionDeck } from "./useConnectionDeck";
import { useConnectionPanel } from "./useConnectionPanel";
import { useConnectionCardGestures } from "./useConnectionCardGestures";

/**
 * Everything the smart-connections page needs, composed from the focused hooks above:
 * the card deck, card motion and gestures, card and list actions, insight panels and the snack message.
 */
export const useConnectionLogic = () => {
    const { user: authUser, loading: authLoading } = useUserContext();
    // Platform-wide stats are admin-only on the server, so only admins request them
    const isAdmin = authUser?.role === "admin";

    const [viewerProfile, setViewerProfile] = useState(null);
    const [sending, setSending] = useState(false);
    const [showExpertise, setShowExpertise] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [panelLoading, setPanelLoading] = useState(false);
    const [snack, setSnack] = useState("");
    const [showCardMenu, setShowCardMenu] = useState(false);

    // --- Animation & Gestures ---
    const {
        dragX,
        mouseX,
        mouseY,
        springRotateX,
        springRotateY,
        rotate,
        transformOrigin,
        likeScale,
        nopeScale,
        likeOpacity,
        nopeOpacity,
        bgGlow,
        controls,
    } = useConnectionCardMotion();

    // The signed-in user the loaders are working for. A response that arrives after the account
    // changed (logout / switch) belongs to the previous user and is dropped.
    const ownerIdRef = useRef(authUser?.id ?? null);
    const isStaleFor = (ownerId) => ownerId !== ownerIdRef.current;

    // Which insight panel is open; set below once useConnectionPanel has read the URL
    const activePanelRef = useRef(null);
    const insights = useConnectionInsights({ ownerIdRef, isStaleFor, setPanelLoading, isAdmin, activePanelRef });
    const { setSavedProfiles, preferredIds, notPreferredIds, savedCandidateIds } = insights;
    const { fetchHistory, fetchSavedProfiles, fetchPreferences, refreshInsights } = insights;

    const snackTimerRef = useRef(null);
    useEffect(() => () => clearTimeout(snackTimerRef.current), []);

    const showSnack = (msg) => {
        setSnack(msg);
        clearTimeout(snackTimerRef.current);
        snackTimerRef.current = setTimeout(() => setSnack(""), 2000);
    };

    const fetchViewerProfile = async () => {
        const ownerId = ownerIdRef.current;
        try {
            const data = await usersApi.getMyProfile();
            if (isStaleFor(ownerId)) return;
            setViewerProfile(data?.user || null);
        } catch (err) {
            console.error("Failed to fetch viewer profile:", err);
        }
    };

    const deck = useConnectionDeck({
        authUser,
        authLoading,
        ownerIdRef,
        isStaleFor,
        sending,
        resetCard: () => {
            setShowExpertise(false);
            setShowCardMenu(false);
            controls.set({ x: 0, opacity: 1, scale: 0.9, y: 50 });
            dragX.set(0);
            mouseX.set(0);
            mouseY.set(0);
        },
        onAccountReady: () => {
            fetchViewerProfile();
            fetchPreferences({ silent: true });
        },
    });
    const { user } = deck;

    const { activePanel, updateActivePanel } = useConnectionPanel({ isAdmin, loaders: insights });
    activePanelRef.current = activePanel;

    const cardActions = useConnectionCardActions({
        user,
        sending,
        setSending,
        dragX,
        showSnack,
        advanceToNextUser: deck.advanceToNextUser,
        refreshInsights,
        fetchPreferences,
        fetchSavedProfiles,
        fetchHistory,
        savedCandidateIds,
    });

    const listActions = useConnectionListActions({
        showSnack,
        setSavedProfiles,
        fetchSavedProfiles,
        refreshInsights,
        setSelectedSection,
    });

    const gestures = useConnectionCardGestures({
        sending,
        dragX,
        mouseX,
        mouseY,
        handleInterested: cardActions.handleInterested,
        handleIgnore: cardActions.handleIgnore,
    });

    const isPreferred = useMemo(() => user?.id && preferredIds.has(user.id), [user?.id, preferredIds]);
    const isNotPreferred = useMemo(() => user?.id && notPreferredIds.has(user.id), [user?.id, notPreferredIds]);

    return {
        // State
        user,
        nextUser: deck.nextUser,
        userQueue: deck.userQueue,
        viewerProfile,
        loading: deck.loading,
        sending,
        isFetchingMore: deck.isFetchingMore,
        showExpertise,
        activePanel,
        selectedSection,
        panelLoading,
        snack,
        showCardMenu,
        historyData: insights.historyData,
        preferencesData: insights.preferencesData,
        savedProfiles: insights.savedProfiles,
        analyticsData: insights.analyticsData,
        adminAnalytics: insights.adminAnalytics,
        isAdmin,

        // Motion Values
        dragX,
        springRotateX,
        springRotateY,
        rotate,
        transformOrigin,
        likeScale,
        nopeScale,
        likeOpacity,
        nopeOpacity,
        bgGlow,
        controls,

        // Handlers (plus savingProfile / actionInProgress from the action hooks)
        updateActivePanel,
        setShowExpertise,
        setSelectedSection,
        setShowCardMenu,
        ...cardActions,
        ...listActions,
        ...gestures,
        refreshMatches: deck.refreshMatches,

        // Derived
        isPreferred,
        isNotPreferred,
        savedCandidateIds,
    };
};

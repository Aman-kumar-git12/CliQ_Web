import { useState, useEffect, useRef, useMemo } from "react";
import * as connectionsApi from "../api/connections";
import * as usersApi from "../api/users";
import { animate } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import {
    readSmartConnectionsCache,
    writeSmartConnectionsCache,
    warmSmartConnectionsCache,
} from "../utils/smartConnectionCache";
import { getPanelFromUrl, getUrlFromPanel } from "../utils/connectionLogicDefaults";
import { useConnectionCardMotion } from "./useConnectionCardMotion";
import { useConnectionInsights } from "./useConnectionInsights";
import { useConnectionListActions } from "./useConnectionListActions";
import { useConnectionCardActions } from "./useConnectionCardActions";
import { reportSmartCardShown } from "../utils/connectionCardTracking";

export const useConnectionLogic = () => {
    const { panel } = useParams();
    const navigate = useNavigate();
    const { user: authUser, loading: authLoading } = useUserContext();
    // Platform-wide stats are admin-only on the server, so only admins request them
    const isAdmin = authUser?.role === "admin";

    const [user, setUser] = useState(null);
    const [nextUser, setNextUser] = useState(null);
    const [userQueue, setUserQueue] = useState([]);
    const [viewerProfile, setViewerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [showExpertise, setShowExpertise] = useState(false);
    const [activePanel, setActivePanel] = useState(null);
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

    const SWIPE_THRESHOLD = 180;
    const PREFETCH_QUEUE_TARGET = 6;
    const lastPrefetchAtRef = useRef(0);
    const lastTrackedShownRef = useRef("");

    // The signed-in user the loaders are working for. A response that arrives after the account
    // changed (logout / switch) belongs to the previous user and is dropped.
    const ownerIdRef = useRef(authUser?.id ?? null);
    const isStaleFor = (ownerId) => ownerId !== ownerIdRef.current;

    const {
        historyData,
        preferencesData,
        savedProfiles,
        setSavedProfiles,
        analyticsData,
        adminAnalytics,
        preferredIds,
        notPreferredIds,
        savedCandidateIds,
        fetchHistory,
        fetchSavedProfiles,
        fetchPreferences,
        fetchAnalytics,
        fetchAdminAnalytics,
        refreshInsights,
    } = useConnectionInsights({ ownerIdRef, isStaleFor, setPanelLoading });

    const snackTimerRef = useRef(null);
    useEffect(() => () => clearTimeout(snackTimerRef.current), []);

    const showSnack = (msg) => {
        setSnack(msg);
        clearTimeout(snackTimerRef.current);
        snackTimerRef.current = setTimeout(() => setSnack(""), 2000);
    };

    const applyBatchToDeck = (batch = []) => {
        if (batch.length > 0) {
            setUser(batch[0]);
            setNextUser(batch[1] || null);
            setUserQueue(batch.slice(2));
            return true;
        }

        setUser(null);
        setNextUser(null);
        setUserQueue([]);
        return false;
    };

    const updateActivePanel = (newPanel) => {
        setActivePanel(newPanel);
        const urlSegment = getUrlFromPanel(newPanel);
        if (urlSegment) {
            navigate(`/find/getconnection/${urlSegment}`, { replace: true });
        } else {
            navigate("/find/getconnection", { replace: true });
        }
    };

    // --- Fetching Logic ---
    const fetchSmartBatch = async (excludeIds = [], { refresh = false } = {}) => {
        try {
            const params = new URLSearchParams();
            excludeIds.forEach((id) => params.append("excludeIds", id));
            if (refresh) params.append("refresh", "true");
            const data = await connectionsApi.getSmartUsers(`?${params.toString()}`);
            const batch = Array.isArray(data) ? data : [];
            if (authUser?.id && excludeIds.length === 0 && batch.length > 0) {
                writeSmartConnectionsCache(authUser.id, batch);
            }
            return batch;
        } catch (err) {
            console.error("Error fetching smart users:", err);
            return [];
        }
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

    const initializeUsers = async ({ excludeIds = [], refresh = false } = {}) => {
        const canUseCachedBatch = authUser?.id && excludeIds.length === 0 && !refresh;
        if (canUseCachedBatch) {
            const cachedBatch = readSmartConnectionsCache(authUser.id);
            if (cachedBatch.length > 0) {
                setLoading(false);
                applyBatchToDeck(cachedBatch);
                warmSmartConnectionsCache({ userId: authUser.id });
                return;
            }
        }

        const ownerId = ownerIdRef.current;
        setLoading(true);
        applyBatchToDeck([]);
        const batch = await fetchSmartBatch(excludeIds, { refresh });
        if (isStaleFor(ownerId)) return; // the account changed while this batch loaded
        applyBatchToDeck(batch);
        setLoading(false);
    };

    // --- Event Logic ---
    const trackShownCard = async (activeUser) => {
        if (!activeUser?.id) return;
        const trackingKey = `${activeUser.id}:${activeUser.matchScore || ""}:${activeUser.selectionMode || ""}`;
        if (lastTrackedShownRef.current === trackingKey) return;
        lastTrackedShownRef.current = trackingKey;
        try {
            await reportSmartCardShown(activeUser);
        } catch (err) {
            console.error("Failed to track shown card:", err);
        }
    };

    const advanceToNextUser = async () => {
        setShowExpertise(false);
        setShowCardMenu(false);
        controls.set({ x: 0, opacity: 1, scale: 0.9, y: 50 });
        dragX.set(0);
        mouseX.set(0);
        mouseY.set(0);

        if (nextUser) {
            setUser(nextUser);
            const newQueue = [...userQueue];
            if (newQueue.length > 0) {
                const next = newQueue.shift();
                setNextUser(next);
                setUserQueue(newQueue);
            } else {
                setNextUser(null);
            }
            if (newQueue.length <= 2) fetchMoreUsers();
        } else {
            initializeUsers();
        }
    };

    const fetchMoreUsers = async () => {
        if (isFetchingMore) return;
        lastPrefetchAtRef.current = Date.now();
        setIsFetchingMore(true);
        const currentIds = [user?.id, nextUser?.id, ...userQueue.map((u) => u.id)].filter(Boolean);
        const ownerId = ownerIdRef.current;
        const newBatch = await fetchSmartBatch(currentIds);
        if (isStaleFor(ownerId)) {
            setIsFetchingMore(false);
            return;
        }
        if (newBatch.length > 0) {
            setUserQueue((prev) => {
                const combined = [...prev, ...newBatch];
                const seen = new Set();
                return combined.filter((u) => u.id && !seen.has(u.id) && seen.add(u.id));
            });
        }
        setIsFetchingMore(false);
    };

    const {
        savingProfile,
        handleIgnore,
        handleInterested,
        handleMarkPreferred,
        handleMarkNotPreferred,
        handleSaveProfile,
    } = useConnectionCardActions({
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
    });

    const {
        actionInProgress,
        handleRemoveSaved,
        handleSendFromSaved,
        handleResetSection,
        handleActionFromList,
        handleRemoveSectionItem,
    } = useConnectionListActions({
        showSnack,
        setSavedProfiles,
        fetchSavedProfiles,
        refreshInsights,
        setSelectedSection,
    });

    const handleDragEnd = async (_, info) => {
        const swipe = info.offset.x;
        const velocity = info.velocity.x;
        if (swipe > SWIPE_THRESHOLD || velocity > 500) {
            handleInterested();
        } else if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
            handleIgnore();
        } else {
            animate(dragX, 0, { type: "spring", stiffness: 400, damping: 25 });
        }
    };

    const handleMouseMove = (e) => {
        if (sending) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // --- Effects & Handlers ---
    useEffect(() => {
        const targetPanel = getPanelFromUrl(panel);
        if (targetPanel !== activePanel) setActivePanel(targetPanel);
        // The URL drives the panel; activePanel is read only to skip a no-op update
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panel]);

    useEffect(() => {
        ownerIdRef.current = authUser?.id ?? null;
        if (authLoading) return;
        initializeUsers();
        fetchViewerProfile();
        fetchPreferences({ silent: true });
        // Load once per signed-in user; the fetch helpers are recreated every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, authUser?.id]);

    useEffect(() => {
        if (activePanel === "dashboard") {
            fetchAnalytics();
            if (isAdmin) fetchAdminAnalytics();
            return;
        }

        if (activePanel === "history") {
            fetchHistory();
            fetchPreferences({ silent: true });
            return;
        }

        if (activePanel === "saved") {
            fetchSavedProfiles();
        }
        // Load a panel's data when it opens; the fetch helpers are recreated every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel, isAdmin]);

    useEffect(() => {
        if (user?.id) trackShownCard(user);
        // Track each card once when it appears, not every time its object is recreated
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        if (loading || isFetchingMore || sending) return;
        const availableCards = (user ? 1 : 0) + (nextUser ? 1 : 0) + userQueue.length;
        const prefetchCooldownActive = Date.now() - lastPrefetchAtRef.current < 4000;
        if (availableCards > 0 && availableCards < PREFETCH_QUEUE_TARGET && !prefetchCooldownActive) {
            fetchMoreUsers();
        }
        // Re-check the queue when its size or loading state changes; fetchMoreUsers is recreated every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, isFetchingMore, sending, user, nextUser, userQueue.length]);

    const refreshMatches = () => {
        initializeUsers({ refresh: true });
    };

    const isPreferred = useMemo(() => user?.id && preferredIds.has(user.id), [user?.id, preferredIds]);
    const isNotPreferred = useMemo(() => user?.id && notPreferredIds.has(user.id), [user?.id, notPreferredIds]);

    return {
        // State
        user,
        nextUser,
        userQueue,
        viewerProfile,
        loading,
        sending,
        isFetchingMore,
        showExpertise,
        activePanel,
        selectedSection,
        actionInProgress,
        panelLoading,
        savingProfile,
        snack,
        showCardMenu,
        historyData,
        preferencesData,
        savedProfiles,
        analyticsData,
        adminAnalytics,
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

        // Handlers
        updateActivePanel,
        setShowExpertise,
        setSelectedSection,
        setShowCardMenu,
        handleIgnore,
        handleInterested,
        handleMarkPreferred,
        handleMarkNotPreferred,
        handleSaveProfile,
        handleRemoveSaved,
        handleSendFromSaved,
        handleResetSection,
        handleActionFromList,
        handleRemoveSectionItem,
        handleDragEnd,
        handleMouseMove,
        handleMouseLeave,
        refreshMatches,

        // Derived
        isPreferred,
        isNotPreferred,
        savedCandidateIds,
    };
};

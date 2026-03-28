import { useState, useEffect, useRef, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { useMotionValue, useTransform, useAnimation, animate, useSpring } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";

const PLACEHOLDER_VALUES = new Set(["", "****", "professional seeker", "n/a", "na", "null", "undefined"]);

export const useConnectionLogic = () => {
    const { panel } = useParams();
    const navigate = useNavigate();

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
    const [actionInProgress, setActionInProgress] = useState(new Set());
    const [panelLoading, setPanelLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [snack, setSnack] = useState("");
    const [showCardMenu, setShowCardMenu] = useState(false);

    const [historyData, setHistoryData] = useState({
        counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
        conversion: { interestRate: 0, saveRate: 0 },
        sections: { shown: [], saved: [], ignored: [], interested: [] },
        timeline: [],
        totalEvents: 0,
    });
    const [preferencesData, setPreferencesData] = useState({
        interested: [],
        notInterested: [],
        counts: { interested: 0, notInterested: 0 }
    });
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [analyticsData, setAnalyticsData] = useState({
        counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
        conversion: { interestRate: 0, saveRate: 0 },
        deliveryBreakdown: {},
        selectionModeBreakdown: {},
        confidenceBreakdown: {},
        profileQualityBreakdown: {},
        sourceBreakdown: {},
        diversityBreakdown: { clusters: {}, profileTypes: {}, locations: {}, backgrounds: {} },
        trend: [],
        funnel: { shown: 0, saved: 0, ignored: 0, interested: 0 },
        uniqueCandidates: 0,
        sampleSize: 0,
    });
    const [adminAnalytics, setAdminAnalytics] = useState({
        counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
        conversion: { interestRate: 0, saveRate: 0 },
        deliveryBreakdown: {},
        selectionModeBreakdown: {},
        confidenceBreakdown: {},
        profileQualityBreakdown: {},
        sourceBreakdown: {},
        diversityBreakdown: { clusters: {}, profileTypes: {}, locations: {}, backgrounds: {} },
        trend: [],
        funnel: { shown: 0, saved: 0, ignored: 0, interested: 0 },
        uniqueCandidates: 0,
        sampleSize: 0,
        activeUsers: 0,
        totalUsers: 0,
        coverageRate: 0,
    });

    // --- Animation & Gestures ---
    const dragX = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 35 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 35 });
    const rotate = useTransform(dragX, [-300, 300], [-35, 35]);
    const transformOrigin = useTransform(dragX, (x) => (x >= 0 ? "bottom right" : "bottom left"));
    
    const likeScale = useTransform(dragX, [0, 150], [0.8, 1.2]);
    const nopeScale = useTransform(dragX, [-150, 0], [1.2, 0.8]);
    const likeOpacity = useTransform(dragX, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(dragX, [-150, -50], [1, 0]);
    
    const bgGlow = useTransform(
        dragX,
        [-150, 0, 150],
        ["rgba(239, 68, 68, 0.08)", "rgba(255, 255, 255, 0)", "rgba(34, 197, 94, 0.08)"]
    );
    
    const controls = useAnimation();
    const SWIPE_THRESHOLD = 180;
    const PREFETCH_QUEUE_TARGET = 6;
    const lastPrefetchAtRef = useRef(0);
    const lastTrackedShownRef = useRef("");

    // --- Helpers ---
    const preferredIds = useMemo(() => new Set((preferencesData.interested || []).map(p => p.candidateUserId || p.candidate?.id || p.id)), [preferencesData.interested]);
    const notPreferredIds = useMemo(() => new Set((preferencesData.notInterested || []).map(p => p.candidateUserId || p.candidate?.id || p.id)), [preferencesData.notInterested]);
    const savedCandidateIds = useMemo(() => new Set(savedProfiles.map((item) => item?.candidate?.id).filter(Boolean)), [savedProfiles]);

    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    const getPanelFromUrl = (urlPanel) => {
        if (urlPanel === "recomendation=true") return "dashboard";
        if (urlPanel === "history=true") return "history";
        if (urlPanel === "saved=true") return "saved";
        return null;
    };

    const getUrlFromPanel = (internalPanel) => {
        if (internalPanel === "dashboard") return "recomendation=true";
        if (internalPanel === "history") return "history=true";
        if (internalPanel === "saved") return "saved=true";
        return null;
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
            excludeIds.forEach(id => params.append("excludeIds", id));
            if (refresh) params.append("refresh", "true");
            const res = await axiosClient.get(`/request/smart-users?${params.toString()}`);
            return res.data || [];
        } catch (err) {
            console.error("Error fetching smart users:", err);
            return [];
        }
    };

    const fetchHistory = async ({ silent = false } = {}) => {
        if (!silent) setPanelLoading(true);
        try {
            const res = await axiosClient.get("/request/smart-users/history");
            setHistoryData(res.data || {
                counts: { shown: 0, saved: 0, ignored: 0, interested: 0 },
                conversion: { interestRate: 0, saveRate: 0 },
                sections: { shown: [], saved: [], ignored: [], interested: [] },
                timeline: [],
                totalEvents: 0,
            });
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchSavedProfiles = async ({ silent = false } = {}) => {
        if (!silent) setPanelLoading(true);
        try {
            const res = await axiosClient.get("/request/smart-users/saved");
            setSavedProfiles(res.data?.savedProfiles || []);
        } catch (err) {
            console.error("Failed to fetch saved profiles:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchViewerProfile = async () => {
        try {
            const res = await axiosClient.get("/profile");
            setViewerProfile(res.data?.user || null);
        } catch (err) {
            console.error("Failed to fetch viewer profile:", err);
        }
    };

    const fetchPreferences = async ({ silent = false } = {}) => {
        if (!silent) setPanelLoading(true);
        try {
            const [intRes, notIntRes] = await Promise.all([
                axiosClient.get("/request/preferences/interested"),
                axiosClient.get("/request/preferences/not-interested")
            ]);
            setPreferencesData({
                interested: intRes.data || [],
                notInterested: notIntRes.data || [],
                counts: {
                    interested: (intRes.data || []).length,
                    notInterested: (notIntRes.data || []).length
                }
            });
        } catch (err) {
            console.error("Failed to fetch preferences:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchAnalytics = async ({ silent = false } = {}) => {
        if (!silent) setPanelLoading(true);
        try {
            const res = await axiosClient.get("/request/smart-users/analytics");
            setAnalyticsData(res.data || analyticsData);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchAdminAnalytics = async ({ silent = false } = {}) => {
        if (!silent) setPanelLoading(true);
        try {
            const res = await axiosClient.get("/request/smart-users/admin-analytics");
            setAdminAnalytics(res.data || adminAnalytics);
        } catch (err) {
            console.error("Failed to fetch admin analytics:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const refreshInsights = () => {
        fetchHistory({ silent: true });
        fetchSavedProfiles({ silent: true });
        fetchAnalytics({ silent: true });
        fetchAdminAnalytics({ silent: true });
        fetchPreferences({ silent: true });
    };

    const initializeUsers = async ({ excludeIds = [], refresh = false } = {}) => {
        setLoading(true);
        setUser(null);
        setNextUser(null);
        setUserQueue([]);
        const batch = await fetchSmartBatch(excludeIds, { refresh });
        if (batch.length > 0) {
            setUser(batch[0]);
            setNextUser(batch[1] || null);
            setUserQueue(batch.slice(2));
        }
        setLoading(false);
    };

    // --- Event Logic ---
    const trackShownCard = async (activeUser) => {
        if (!activeUser?.id) return;
        const trackingKey = `${activeUser.id}:${activeUser.matchScore || ""}:${activeUser.selectionMode || ""}`;
        if (lastTrackedShownRef.current === trackingKey) return;
        lastTrackedShownRef.current = trackingKey;
        try {
            await axiosClient.post(`/request/smart-users/shown/${activeUser.id}`, {
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
            });
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
        const currentIds = [user?.id, nextUser?.id, ...userQueue.map(u => u.id)].filter(Boolean);
        const newBatch = await fetchSmartBatch(currentIds);
        if (newBatch.length > 0) {
            setUserQueue(prev => {
                const combined = [...prev, ...newBatch];
                const seen = new Set();
                return combined.filter(u => u.id && !seen.has(u.id) && seen.add(u.id));
            });
        }
        setIsFetchingMore(false);
    };

    const handleIgnore = async () => {
        if (!user || sending) return;
        setSending(true);
        await controls.start({ x: -600, opacity: 0, transition: { duration: 0.4, ease: "anticipate" } });
        try {
            await axiosClient.post(`/request/send/ignored/${user.id}`, { source: "smart_connections" });
            showSnack("Ignored");
            refreshInsights();
            await advanceToNextUser();
        } catch (err) {
            console.error("Failed to ignore:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
        }
    };

    const handleInterested = async () => {
        if (!user || sending) return;
        setSending(true);
        try {
            await controls.start({ x: 600, opacity: 0, transition: { duration: 0.4, ease: "anticipate" } });
            await axiosClient.post(`/request/send/interested/${user.id}`, { source: "smart_connections" });
            showSnack("Request sent");
            refreshInsights();
            await advanceToNextUser();
        } catch (err) {
            console.error("Failed to send interest:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
        }
    };

    const handleMarkPreferred = async () => {
        if (!user || sending) return;
        setSending(true);
        try {
            const res = await axiosClient.post(`/request/smart-users/interest/${user.id}`, { source: "smart_connections" });
            showSnack(res?.data?.message || "Marked as Preferred");
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
            const res = await axiosClient.post(`/request/smart-users/not-interest/${user.id}`, { source: "smart_connections" });
            showSnack(res?.data?.message || "Marked as Not Preferred");
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
            await axiosClient.post(`/request/smart-users/save/${user.id}`, { source: "smart_connections" });
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

    const handleRemoveSaved = async (candidateUserId) => {
        setSavedProfiles(prev => prev.filter(item => (item.candidate?.id || item.id) !== candidateUserId));
        try {
            await axiosClient.delete(`/request/smart-users/save/${candidateUserId}`);
            showSnack("Removed from saved");
            fetchSavedProfiles({ silent: true });
        } catch (err) {
            console.error("Failed to remove saved:", err);
            showSnack("Failed to remove from saved");
            fetchSavedProfiles({ silent: true });
        }
    };

    const handleSendFromSaved = async (candidateUserId) => {
        setSavedProfiles(prev => prev.filter(item => (item.candidate?.id || item.id) !== candidateUserId));
        try {
            await axiosClient.post(`/request/send/interested/${candidateUserId}`, { source: "saved_recommendations" });
            await axiosClient.delete(`/request/smart-users/save/${candidateUserId}`);
            showSnack("Request sent");
            refreshInsights();
        } catch (err) {
            console.error("Failed to send from saved:", err);
            showSnack("Failed to send request");
            fetchSavedProfiles({ silent: true });
        }
    };

    const handleResetSection = async (section) => {
        if (!window.confirm(`Are you sure you want to reset the list?`)) return;
        try {
            await axiosClient.delete(`/request/smart-users/section/${section}`);
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
        setActionInProgress(prev => new Set(prev).add(candidateUserId));
        try {
            const endpoint = targetAction === "preferred" ? "interest" : "not-interest";
            await axiosClient.post(`/request/smart-users/${endpoint}/${candidateUserId}`, { source: "list_action" });
            showSnack(`Moved to ${targetAction === "preferred" ? "Preferred" : "Not Preferred"}`);
            refreshInsights();
        } catch (err) {
            console.error(`Failed to move to ${targetAction}:`, err);
            showSnack("Action failed");
        } finally {
            setActionInProgress(prev => {
                const updated = new Set(prev);
                updated.delete(candidateUserId);
                return updated;
            });
        }
    };

    const handleRemoveSectionItem = async (action, candidateUserId) => {
        try {
            await axiosClient.delete(`/request/smart-users/section/${action}/${candidateUserId}`);
            showSnack("Item removed");
            refreshInsights();
        } catch (err) {
            console.error(`Failed to remove item:`, err);
            showSnack("Failed to update list");
        }
    };

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
    }, [panel]);

    useEffect(() => {
        initializeUsers();
        refreshInsights();
        fetchViewerProfile();
    }, []);

    useEffect(() => {
        if (user?.id) trackShownCard(user);
    }, [user?.id]);

    useEffect(() => {
        if (loading || isFetchingMore || sending) return;
        const availableCards = (user ? 1 : 0) + (nextUser ? 1 : 0) + userQueue.length;
        const prefetchCooldownActive = Date.now() - lastPrefetchAtRef.current < 4000;
        if (availableCards > 0 && availableCards < PREFETCH_QUEUE_TARGET && !prefetchCooldownActive) {
            fetchMoreUsers();
        }
    }, [loading, isFetchingMore, sending, user, nextUser, userQueue.length]);

    const refreshMatches = () => {
        initializeUsers({ refresh: true });
    };

    const isPreferred = useMemo(() => user?.id && preferredIds.has(user.id), [user?.id, preferredIds]);
    const isNotPreferred = useMemo(() => user?.id && notPreferredIds.has(user.id), [user?.id, notPreferredIds]);

    return {
        // State
        user, nextUser, userQueue, viewerProfile, loading, sending, isFetchingMore,
        showExpertise, activePanel, selectedSection, actionInProgress, panelLoading,
        savingProfile, snack, showCardMenu, historyData, preferencesData, savedProfiles,
        analyticsData, adminAnalytics,
        
        // Motion Values
        dragX, springRotateX, springRotateY, rotate, transformOrigin, 
        likeScale, nopeScale, likeOpacity, nopeOpacity, bgGlow, controls,
        
        // Handlers
        updateActivePanel, setShowExpertise, setSelectedSection, setShowCardMenu,
        handleIgnore, handleInterested, handleMarkPreferred, handleMarkNotPreferred,
        handleSaveProfile, handleRemoveSaved, handleSendFromSaved, handleResetSection,
        handleActionFromList, handleRemoveSectionItem, handleDragEnd, handleMouseMove, handleMouseLeave,
        refreshMatches,
        
        // Derived
        isPreferred, isNotPreferred, savedCandidateIds
    };
};

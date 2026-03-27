import { useState, useEffect, useRef, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import { X, Check, ShieldCheck, Sparkles, Bookmark, History, Send, BarChart3, Trash2, MoreVertical } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ConnectionCard from "./ConnectionCard";
import { motion, useMotionValue, useTransform, useAnimation, animate, AnimatePresence, useSpring } from "framer-motion";
import MyExperties from "../MyExperties/MyExperties";
import MatchCardShimmering from "../shimmering/MatchCardShimmering";

const PLACEHOLDER_VALUES = new Set(["", "****", "professional seeker", "n/a", "na", "null", "undefined"]);

export default function GetConnections() {
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

    const preferredIds = useMemo(() => new Set((preferencesData.interested || []).map(p => p.candidateUserId || p.candidate?.id || p.id)), [preferencesData.interested]);
    const notPreferredIds = useMemo(() => new Set((preferencesData.notInterested || []).map(p => p.candidateUserId || p.candidate?.id || p.id)), [preferencesData.notInterested]);

    const isPreferred = user ? preferredIds.has(user.id) : false;
    const isNotPreferred = user ? notPreferredIds.has(user.id) : false;
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
    const [showCardMenu, setShowCardMenu] = useState(false);
    const { panel } = useParams();
    const navigate = useNavigate();

    // Map URL panel string to internal state
    const getPanelFromUrl = (urlPanel) => {
        if (urlPanel === "recomendation=true") return "dashboard";
        if (urlPanel === "history=true") return "history";
        if (urlPanel === "saved=true") return "saved";
        return null;
    };

    // Map internal state to URL panel string
    const getUrlFromPanel = (internalPanel) => {
        if (internalPanel === "dashboard") return "recomendation=true";
        if (internalPanel === "history") return "history=true";
        if (internalPanel === "saved") return "saved=true";
        return null;
    };

    // Sync state with URL on mount and param changes
    useEffect(() => {
        const targetPanel = getPanelFromUrl(panel);
        if (targetPanel !== activePanel) {
            setActivePanel(targetPanel);
        }
    }, [panel]);

    // Update URL when activePanel changes via UI actions
    const updateActivePanel = (newPanel) => {
        setActivePanel(newPanel);
        const urlSegment = getUrlFromPanel(newPanel);
        if (urlSegment) {
            navigate(`/find/getconnection/${urlSegment}`, { replace: true });
        } else {
            navigate("/find/getconnection", { replace: true });
        }
    };


    const dragX = useMotionValue(0);

    // Parallax Tilt Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 35 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 35 });

    const rotate = useTransform(dragX, [-300, 300], [-35, 35]);

    const bgGlow = useTransform(
        dragX,
        [-150, 0, 150],
        ["rgba(239, 68, 68, 0.08)", "rgba(255, 255, 255, 0)", "rgba(34, 197, 94, 0.08)"]
    );

    const transformOrigin = useTransform(dragX, (x) =>
        x >= 0 ? "bottom right" : "bottom left"
    );

    const likeScale = useTransform(dragX, [0, 150], [0.8, 1.2]);
    const nopeScale = useTransform(dragX, [-150, 0], [1.2, 0.8]);

    // Stamp opacities — MUST be top-level hooks, NOT inside JSX
    const likeOpacity = useTransform(dragX, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(dragX, [-150, -50], [1, 0]);

    const controls = useAnimation();
    const SWIPE_THRESHOLD = 180;
    const PREFETCH_QUEUE_TARGET = 6;
    const lastPrefetchAtRef = useRef(0);
    const lastTrackedShownRef = useRef("");

    const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
    const normalizeText = (value) => (value === null || value === undefined ? "" : String(value).trim());
    const isMeaningfulText = (value) => {
        const normalized = normalizeText(value);
        return Boolean(normalized) && !PLACEHOLDER_VALUES.has(normalized.toLowerCase());
    };
    const normalizeTerms = (value) => {
        const rawItems = Array.isArray(value) ? value : normalizeText(value).split(/[,|\n;/]+/);
        const seen = new Set();
        return rawItems
            .map((item) => normalizeText(item))
            .filter((item) => isMeaningfulText(item) && !seen.has(item.toLowerCase()) && seen.add(item.toLowerCase()));
    };
    const getProfileSignal = (expertise = {}) => {
        const skills = normalizeTerms(expertise.skills);
        const interests = normalizeTerms(expertise.interests);
        const textFields = [
            expertise.description,
            expertise.aboutYou,
            expertise.experience,
            expertise.projects,
            expertise.achievements,
            expertise.details?.address,
        ].filter(isMeaningfulText);
        const headline = [expertise.description, expertise.aboutYou, expertise.experience, expertise.name]
            .find(isMeaningfulText) || "";
        const completeness = [headline, ...skills, ...interests, ...textFields].length;
        const qualityScore = Math.max(0, Math.min(1,
            (headline ? 0.32 : 0) +
            Math.min(skills.length, 5) * 0.09 +
            Math.min(interests.length, 4) * 0.06 +
            Math.min(textFields.length, 4) * 0.08
        ));

        return {
            skills,
            interests,
            textFields,
            headline,
            completeness,
            qualityScore: Number(qualityScore.toFixed(4)),
        };
    };
    const getViewerProfileNudge = (expertise = {}) => {
        const signal = getProfileSignal(expertise);
        if (signal.qualityScore >= 0.42) return null;
        if (!signal.headline && signal.skills.length === 0 && signal.interests.length === 0) {
            return "Complete your profile to unlock better smart matches.";
        }
        if (signal.skills.length === 0) {
            return "Add a few skills to improve recommendation quality.";
        }
        if (!signal.headline) {
            return "Add a short bio or description so match quality improves.";
        }
        return "Complete your profile to improve the strength of your recommendations.";
    };
    const getConfidenceBadgeClass = (confidence = "") => {
        if (confidence.toLowerCase().includes("low")) {
            return "text-amber-200/95 bg-amber-400/10 border-amber-400/25";
        }
        if (confidence.toLowerCase().includes("high") || confidence.toLowerCase().includes("strong")) {
            return "text-emerald-300/90 bg-emerald-400/10 border-emerald-400/20";
        }
        return "text-cyan-200/90 bg-cyan-400/10 border-cyan-400/20";
    };
    const savedCandidateIds = new Set(savedProfiles.map((item) => item?.candidate?.id).filter(Boolean));
    const viewerProfileNudge = getViewerProfileNudge(viewerProfile?.expertise || {});
    const dedupeUsers = (users = []) => {
        const seen = new Set();
        return users.filter((candidate) => {
            if (!candidate?.id || seen.has(candidate.id)) return false;
            seen.add(candidate.id);
            return true;
        });
    };

    const fetchSmartBatch = async (excludeIds = [], { refresh = false } = {}) => {
        try {
            const params = new URLSearchParams();
            excludeIds.forEach(id => params.append("excludeIds", id));
            if (refresh) {
                params.append("refresh", "true");
            }
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

    const refreshMatches = async () => {
        const visibleIds = [
            user?.id,
            nextUser?.id,
            ...userQueue.map((candidate) => candidate?.id),
        ].filter(Boolean);

        await initializeUsers({ excludeIds: visibleIds, refresh: true });
    };

    const fetchMoreUsers = async () => {
        if (isFetchingMore) return;
        lastPrefetchAtRef.current = Date.now();
        setIsFetchingMore(true);

        const currentIds = [
            user?.id,
            nextUser?.id,
            ...userQueue.map(u => u.id)
        ].filter(Boolean);

        const newBatch = await fetchSmartBatch(currentIds);
        if (newBatch.length > 0) {
            setUserQueue(prev => dedupeUsers([...prev, ...newBatch]));
        }
        setIsFetchingMore(false);
    };

    const advanceToNextUser = async () => {
        setShowExpertise(false);
        setShowCardMenu(false);
        controls.set({ x: 0, opacity: 1, scale: 0.9, y: 50 });
        dragX.set(0);
        mouseX.set(0);
        mouseY.set(0);

        if (nextUser) {
            const currentUser = nextUser;
            setUser(currentUser);

            // Manage Queue
            const newQueue = [...userQueue];
            if (newQueue.length > 0) {
                const next = newQueue.shift();
                setNextUser(next);
                setUserQueue(newQueue);
            } else {
                setNextUser(null);
            }

            // Low-watermark prefetch: Fetch when queue has 2 or fewer cards
            if (newQueue.length <= 2) {
                fetchMoreUsers();
            }
        } else {
            // Recalculate if we ran out completely (fallback)
            initializeUsers();
        }
    };

    useEffect(() => {
        initializeUsers();
        refreshInsights();
        fetchViewerProfile();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        trackShownCard(user);
    }, [user?.id]);

    useEffect(() => {
        if (loading || isFetchingMore || sending) return;
        const availableCards = (user ? 1 : 0) + (nextUser ? 1 : 0) + userQueue.length;
        const prefetchCooldownActive = Date.now() - lastPrefetchAtRef.current < 4000;
        if (availableCards > 0 && availableCards < PREFETCH_QUEUE_TARGET && !prefetchCooldownActive) {
            fetchMoreUsers();
        }
    }, [loading, isFetchingMore, sending, user, nextUser, userQueue.length]);

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

    const [snack, setSnack] = useState("");
    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    const handleIgnore = async () => {
        if (!user || sending) return;
        setSending(true);
        await controls.start({ x: -600, opacity: 0, transition: { duration: 0.4, ease: "anticipate" } });
        try {
            await axiosClient.post(`/request/send/ignored/${user.id}`, { source: "smart_connections" });
            showSnack("Ignored");
            await Promise.all([
                fetchHistory({ silent: true }),
                fetchAnalytics({ silent: true }),
                fetchAdminAnalytics({ silent: true }),
                fetchPreferences({ silent: true }),
            ]);
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
            await Promise.all([
                fetchHistory({ silent: true }),
                fetchAnalytics({ silent: true }),
                fetchAdminAnalytics({ silent: true }),
                fetchPreferences({ silent: true }),
            ]);
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
            await Promise.all([
                fetchPreferences({ silent: true }),
            ]);
        } catch (err) {
            console.error("Failed to mark preferred:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
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
            await Promise.all([
                fetchPreferences({ silent: true }),
            ]);
        } catch (err) {
            console.error("Failed to mark not preferred:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
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

    const handleSaveProfile = async () => {
        if (!user || savingProfile) return;
        setSavingProfile(true);
        try {
            await axiosClient.post(`/request/smart-users/save/${user.id}`, { source: "smart_connections" });
            showSnack(savedCandidateIds.has(user.id) ? "Already saved" : "Saved for later");
            await fetchSavedProfiles({ silent: true });
            await fetchHistory({ silent: true });
        } catch (err) {
            console.error("Failed to save profile:", err);
            showSnack("Failed to save");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRemoveSaved = async (candidateUserId) => {
        // Optimistic update
        setSavedProfiles(prev => prev.filter(item => (item.candidate?.id || item.id) !== candidateUserId));

        try {
            await axiosClient.delete(`/request/smart-users/save/${candidateUserId}`);
            showSnack("Removed from saved");
            await fetchSavedProfiles({ silent: true });
            await fetchHistory({ silent: true });
        } catch (err) {
            console.error("Failed to remove saved:", err);
            showSnack("Failed to remove from saved");
            // Revert or refresh on failure
            await fetchSavedProfiles({ silent: true });
        }
    };

    const handleResetSection = async (section) => {
        if (!window.confirm(`Are you sure you want to reset the ${formatSectionTitle(section)} section? This will clear all items.`)) {
            return;
        }

        // Optimistic update
        if (section === "my_interest") {
            setPreferencesData(prev => ({ ...prev, interested: [], counts: { ...prev.counts, interested: 0 } }));
        } else if (section === "not_preferred") {
            setPreferencesData(prev => ({ ...prev, notInterested: [], counts: { ...prev.counts, notInterested: 0 } }));
        } else {
            setHistoryData(prev => {
                const newSections = { ...prev.sections };
                if (newSections[section]) newSections[section] = [];
                const newCounts = { ...prev.counts };
                if (newCounts[section]) newCounts[section] = 0;
                return { ...prev, sections: newSections, counts: newCounts };
            });
        }

        try {
            await axiosClient.delete(`/request/smart-users/section/${section}`);
            showSnack(`${formatSectionTitle(section)} section reset`);
            setSelectedSection(null);
            refreshInsights();
            fetchHistory();
            fetchPreferences();
        } catch (err) {
            console.error("Failed to reset section:", err);
            showSnack("Failed to reset section");
            // Refresh on failure to restore state
            fetchHistory();
            fetchPreferences();
        }
    };

    const handleSendFromSaved = async (candidateUserId) => {
        // Optimistic update for removal from saved
        setSavedProfiles(prev => prev.filter(item => (item.candidate?.id || item.id) !== candidateUserId));

        try {
            await axiosClient.post(`/request/send/interested/${candidateUserId}`, { source: "saved_recommendations" });
            await axiosClient.delete(`/request/smart-users/save/${candidateUserId}`);
            showSnack("Request sent");
            await Promise.all([
                fetchSavedProfiles({ silent: true }),
                fetchHistory({ silent: true }),
                fetchAnalytics({ silent: true }),
                fetchAdminAnalytics({ silent: true }),
                fetchPreferences({ silent: true }),
            ]);
        } catch (err) {
            console.error("Failed to send from saved:", err);
            showSnack("Failed to send request");
            // Refresh to restore state on failure
            fetchSavedProfiles({ silent: true });
        }
    };

    const openHistoryPanel = async () => {
        updateActivePanel("history");
        setSelectedSection(null);
        await Promise.all([fetchHistory(), fetchPreferences()]);
    };

    const openSavedPanel = async () => {
        updateActivePanel("saved");
        setSelectedSection(null);
        await fetchSavedProfiles();
    };

    const openDashboardPanel = async () => {
        updateActivePanel("dashboard");
        setSelectedSection(null);
        setPanelLoading(true);
        try {
            await Promise.all([fetchAnalytics(), fetchAdminAnalytics()]);
        } catch (err) {
            console.error("Failed to fetch dashboard content:", err);
        } finally {
            setPanelLoading(false);
        }
    };

    const openHistorySection = (action) => {
        setSelectedSection(action);
    };

    const handleActionFromList = async (targetAction, candidateUserId) => {
        if (actionInProgress.has(candidateUserId)) return;

        setActionInProgress(prev => new Set(prev).add(candidateUserId));
        try {
            const endpoint = targetAction === "preferred" ? "interest" : "not-interest";
            const res = await axiosClient.post(`/request/smart-users/${endpoint}/${candidateUserId}`, { source: "list_action" });
            showSnack(
                res?.data?.message ||
                `Moved to ${targetAction === "preferred" ? "Preferred" : "Not Preferred"}`
            );

            // Background refresh
            await Promise.all([
                refreshInsights(),
                fetchHistory({ silent: true }),
                fetchPreferences({ silent: true })
            ]);
        } catch (err) {
            console.error(`Failed to move to ${targetAction}:`, err);
            showSnack("Action failed");
            setActionInProgress(prev => {
                const updated = new Set(prev);
                updated.delete(candidateUserId);
                return updated;
            });
        }
    };

    const handleRemoveSectionItem = async (action, candidateUserId) => {
        // Optimistic update
        if (action === "my_interest") {
            setPreferencesData(prev => ({
                ...prev,
                interested: (prev.interested || []).filter(p => (p.candidateUserId || p.id) !== candidateUserId),
                counts: { ...prev.counts, interested: Math.max(0, prev.counts.interested - 1) }
            }));
        } else if (action === "not_preferred") {
            setPreferencesData(prev => ({
                ...prev,
                notInterested: (prev.notInterested || []).filter(p => (p.candidateUserId || p.id) !== candidateUserId),
                counts: { ...prev.counts, notInterested: Math.max(0, prev.counts.notInterested - 1) }
            }));
        } else if (action === "saved") {
            setSavedProfiles(prev => prev.filter(item => (item.candidate?.id || item.id) !== candidateUserId));
        } else {
            setHistoryData(prev => {
                const newSections = { ...prev.sections };
                if (newSections[action]) {
                    newSections[action] = newSections[action].filter(item => (item.candidate?.id || item.id) !== candidateUserId);
                }
                const newCounts = { ...prev.counts };
                if (newCounts[action]) {
                    newCounts[action] = Math.max(0, newCounts[action] - 1);
                }
                return { ...prev, sections: newSections, counts: newCounts };
            });
        }

        try {
            await axiosClient.delete(`/request/smart-users/section/${action}/${candidateUserId}`);
            showSnack(`${formatEventLabel(action)} list updated`);
            await fetchHistory({ silent: true });
            if (action === "saved") {
                await fetchSavedProfiles({ silent: true });
            }
        } catch (err) {
            console.error(`Failed to remove ${action} item:`, err);
            showSnack("Failed to update list");
            // Refresh on failure
            fetchHistory({ silent: true });
            fetchPreferences({ silent: true });
            if (action === "saved") fetchSavedProfiles({ silent: true });
        }
    };

    const formatEventLabel = (action) => {
        switch (action) {
            case "shown": return "Shown";
            case "saved": return "Saved";
            case "ignored": return "Ignored";
            case "interested": return "Interested";
            default: return action;
        }
    };

    const formatSectionTitle = (action) => {
        switch (action) {
            case "shown": return "Shown Profiles";
            case "saved": return "Saved Profiles";
            case "ignored": return "Ignored Profiles";
            case "interested": return "Interested Profiles";
            case "my_interest": return "My Current Interest";
            case "not_preferred": return "Not Preferred";
            default: return "Profiles";
        }
    };

    const getSectionActionLabel = (action) => {
        switch (action) {
            case "shown": return "Remove";
            case "saved": return "Unsave";
            case "ignored": return "Remove Ignore";
            case "interested": return "Remove Interest";
            case "my_interest": return "Remove Interest";
            case "not_preferred": return "Remove Not Preferred";
            default: return "Remove";
        }
    };

    const formatEventTime = (value) => {
        try {
            return new Date(value).toLocaleString();
        } catch {
            return "";
        }
    };

    const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;
    const toPairs = (record = {}, limit = 6) => Object.entries(record || {}).slice(0, limit);
    const formatBucketLabel = (value = "") =>
        String(value)
            .replace(/^[a-z]+:/, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

    if (loading) return <div className="grid place-items-center py-20"><MatchCardShimmering /></div>;

    return (
        <motion.div
            style={{ backgroundColor: bgGlow }}
            className="w-full relative min-h-[700px] grid place-items-center pt-8 pb-12 px-4 overflow-hidden rounded-[40px] transition-colors duration-500 bg-[#16161f]"
        >
            {viewerProfileNudge && (
                <div className="absolute top-5 left-5 z-30 max-w-xs rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/80 mb-1">Improve Matches</p>
                    <p className="text-[12px] leading-[1.55] text-amber-50/90">{viewerProfileNudge}</p>
                    <Link
                        to="/profile/expertise=True"
                        className="inline-flex mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 hover:text-white"
                    >
                        Complete Profile
                    </Link>
                </div>
            )}
            <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                <button
                    onClick={openDashboardPanel}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <BarChart3 size={14} />
                    Dashboard
                </button>
                <button
                    onClick={openHistoryPanel}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <History size={14} />
                    History
                </button>
                <button
                    onClick={openSavedPanel}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Bookmark size={14} />
                    Saved
                </button>
            </div>

            <AnimatePresence>
                {!user ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-neutral-500 text-center">
                        <Sparkles size={48} className="mb-4 text-neutral-700" />
                        <p className="text-xl font-black uppercase tracking-widest italic">No more smart matches right now.</p>
                        <button onClick={refreshMatches} className="mt-6 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all shadow-xl">Refresh Matches</button>
                    </motion.div>
                ) : (
                    <ConnectionCard
                        user={user}
                        isPreferred={isPreferred}
                        isNotPreferred={isNotPreferred}
                        dragX={dragX}
                        rotate={rotate}
                        rotateX={springRotateX}
                        rotateY={springRotateY}
                        transformOrigin={transformOrigin}
                        controls={controls}
                        sending={sending}
                        likeOpacity={likeOpacity}
                        nopeOpacity={nopeOpacity}
                        likeScale={likeScale}
                        nopeScale={nopeScale}
                        showCardMenu={showCardMenu}
                        setShowCardMenu={setShowCardMenu}
                        handleMarkPreferred={handleMarkPreferred}
                        handleMarkNotPreferred={handleMarkNotPreferred}
                        handleSaveProfile={handleSaveProfile}
                        savedCandidateIds={savedCandidateIds}
                        savingProfile={savingProfile}
                        setShowExpertise={setShowExpertise}
                        handleIgnore={handleIgnore}
                        handleInterested={handleInterested}
                        isFetchingMore={isFetchingMore}
                        getConfidenceBadgeClass={getConfidenceBadgeClass}
                        handleMouseMove={handleMouseMove}
                        handleMouseLeave={handleMouseLeave}
                        avatar={avatar}
                        handleDragEnd={handleDragEnd}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExpertise && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl max-h-[85vh] rounded-[40px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Full Identity Intel</h3>
                                    {user?.matchReasons?.length > 0 && (
                                        <p className="text-[11px] text-cyan-200/70 mt-1">{user.matchReasons.join(" • ")}</p>
                                    )}
                                </div>
                                <button onClick={() => setShowExpertise(false)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X size={20} className="text-white" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto"><MyExperties expertise={user?.expertise} /></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activePanel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="bg-neutral-950 w-full max-w-5xl max-h-[86vh] rounded-[36px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                        {activePanel === "dashboard"
                                            ? "Recommendation Dashboard"
                                            : activePanel === "history"
                                                ? selectedSection
                                                    ? formatSectionTitle(selectedSection)
                                                    : "Connection History"
                                                : "Saved Profiles"}
                                    </h3>
                                    <p className="text-[11px] text-neutral-400 mt-1">
                                        {activePanel === "dashboard"
                                            ? "Inspect recommendation quality, exploration mix, and engine-wide preference trends."
                                            : activePanel === "history"
                                                ? selectedSection
                                                    ? "Profiles currently grouped under this recommendation section."
                                                    : "Track recommendation actions and preference trends."
                                                : "Profiles you saved from smart recommendations."}
                                    </p>
                                </div>
                                <button onClick={() => updateActivePanel(null)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X size={20} className="text-white" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {panelLoading ? (
                                    <div className="grid place-items-center py-20 text-neutral-500">Loading...</div>
                                ) : activePanel === "dashboard" ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <InsightCard label="Shown" value={analyticsData.counts?.shown || 0} icon={<BarChart3 size={16} />} />
                                            <InsightCard label="Saved" value={analyticsData.counts?.saved || 0} icon={<Bookmark size={16} />} />
                                            <InsightCard label="Interest Rate" value={formatPercent(analyticsData.conversion?.interestRate)} icon={<Send size={16} />} />
                                            <InsightCard label="Save Rate" value={formatPercent(analyticsData.conversion?.saveRate)} icon={<Check size={16} />} />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <BreakdownCard title="Delivery Mix" items={toPairs(analyticsData.deliveryBreakdown)} formatter={formatBucketLabel} />
                                            <BreakdownCard title="Selection Mix" items={toPairs(analyticsData.selectionModeBreakdown)} formatter={formatBucketLabel} />
                                            <BreakdownCard title="Match Confidence" items={toPairs(analyticsData.confidenceBreakdown)} formatter={formatBucketLabel} />
                                            <BreakdownCard title="Profile Quality" items={toPairs(analyticsData.profileQualityBreakdown)} formatter={formatBucketLabel} />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <TrendCard title="Your 14-Day Trend" trend={analyticsData.trend || []} />
                                            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">Engine Snapshot</p>
                                                    <p className="text-sm text-neutral-300 mt-2">
                                                        {adminAnalytics.activeUsers || 0} active users out of {adminAnalytics.totalUsers || 0} total users
                                                    </p>
                                                    <p className="text-[12px] text-cyan-300/80 mt-1">Coverage {formatPercent(adminAnalytics.coverageRate)}</p>
                                                </div>
                                                <BreakdownInline label="Engine Selection Mix" items={toPairs(adminAnalytics.selectionModeBreakdown, 4)} formatter={formatBucketLabel} />
                                                <BreakdownInline label="Engine Delivery Mix" items={toPairs(adminAnalytics.deliveryBreakdown, 4)} formatter={formatBucketLabel} />
                                                <BreakdownInline label="Top Profile Types" items={toPairs(adminAnalytics.diversityBreakdown?.profileTypes, 4)} formatter={formatBucketLabel} />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <BreakdownCard title="Top Clusters" items={toPairs(adminAnalytics.diversityBreakdown?.clusters)} formatter={formatBucketLabel} />
                                            <BreakdownCard title="Top Locations" items={toPairs(adminAnalytics.diversityBreakdown?.locations)} formatter={formatBucketLabel} />
                                        </div>
                                    </div>
                                ) : activePanel === "history" ? (
                                    selectedSection ? (
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <button
                                                    onClick={() => setSelectedSection(null)}
                                                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10"
                                                >
                                                    Back To Summary
                                                </button>
                                                {selectedSection !== "ignored" && selectedSection !== "interested" && (
                                                    <button
                                                        onClick={() => handleResetSection(selectedSection)}
                                                        className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-red-300 hover:bg-red-500/20"
                                                    >
                                                        Reset Section
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {((selectedSection === "my_interest" ? preferencesData.interested : selectedSection === "not_preferred" ? preferencesData.notInterested : historyData.sections?.[selectedSection]) || []).length === 0 && (
                                                    <div className="text-neutral-500 text-sm py-12 text-center rounded-3xl border border-white/5 bg-white/[0.03]">
                                                        No profiles in this section right now.
                                                    </div>
                                                )}
                                                {((selectedSection === "my_interest" ? preferencesData.interested : selectedSection === "not_preferred" ? preferencesData.notInterested : historyData.sections?.[selectedSection]) || []).map((candidateOrItem) => {
                                                    const candidate = candidateOrItem.candidate || candidateOrItem;
                                                    const recordedAt = candidateOrItem.recordedAt || candidateOrItem.updatedAt || new Date();
                                                    return (
                                                        <div key={candidate.id} className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                                                                    <img src={avatar(candidate?.imageUrl)} alt={`${candidate?.firstname} ${candidate?.lastname}`} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-base font-semibold text-white truncate">
                                                                        {candidate.firstname} {candidate.lastname}
                                                                    </p>
                                                                    <p className="text-[12px] text-neutral-400 truncate">
                                                                        {candidate.expertise?.aboutYou || candidate.expertise?.description || formatSectionTitle(selectedSection)}
                                                                    </p>
                                                                    <p className="text-[11px] text-neutral-500 mt-1">
                                                                        {formatEventLabel(selectedSection)} • {formatEventTime(recordedAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(selectedSection === "shown" || selectedSection === "saved") && (
                                                                    <>
                                                                        <button
                                                                            disabled={actionInProgress.has(candidate.id)}
                                                                            onClick={() => handleActionFromList("preferred", candidate.id)}
                                                                            className={`px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300/70 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                        >
                                                                            Preferred
                                                                        </button>
                                                                        <button
                                                                            disabled={actionInProgress.has(candidate.id)}
                                                                            onClick={() => handleActionFromList("not_preferred", candidate.id)}
                                                                            className={`px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-[0.15em] text-red-300/70 hover:bg-red-500/10 hover:text-red-300 transition-colors ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                        >
                                                                            Not Preferred
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <Link to={`/public-profile/${candidate.id}`} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                                                                    View
                                                                </Link>
                                                                <button
                                                                    disabled={actionInProgress.has(candidate.id)}
                                                                    onClick={() => handleRemoveSectionItem(selectedSection, candidate.id)}
                                                                    className={`px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-[0.15em] text-red-300/70 hover:bg-red-500/10 hover:text-red-300 transition-colors ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    {getSectionActionLabel(selectedSection)}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <InsightCard label="Shown" value={historyData.counts?.shown || 0} icon={<BarChart3 size={16} />} onView={() => openHistorySection("shown")} />
                                                <InsightCard label="Saved" value={historyData.counts?.saved || 0} icon={<Bookmark size={16} />} onView={() => openHistorySection("saved")} />
                                                <InsightCard label="Ignored" value={historyData.counts?.ignored || 0} icon={<X size={16} />} onView={() => openHistorySection("ignored")} />
                                                <InsightCard label="Interested" value={historyData.counts?.interested || 0} icon={<Send size={16} />} onView={() => openHistorySection("interested")} />
                                                <InsightCard label="Preferred" value={preferencesData.counts?.interested || 0} icon={<Sparkles size={16} />} onView={() => openHistorySection("my_interest")} />
                                                <InsightCard label="Not Preferred" value={preferencesData.counts?.notInterested || 0} icon={<Trash2 size={16} />} onView={() => openHistorySection("not_preferred")} />
                                                <InsightCard label="Interest Rate" value={formatPercent(historyData.conversion?.interestRate)} icon={<ShieldCheck size={16} />} />
                                                <InsightCard label="Save Rate" value={formatPercent(historyData.conversion?.saveRate)} icon={<Check size={16} />} />
                                            </div>

                                            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-4">Recent Activity</h4>
                                                <div className="space-y-3">
                                                    {(historyData.timeline || []).length === 0 && (
                                                        <div className="text-neutral-500 text-sm py-8 text-center">No recommendation history yet.</div>
                                                    )}
                                                    {(historyData.timeline || []).map((event) => (
                                                        <div key={event.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                                                                    <img src={avatar(event.candidate?.imageUrl)} alt={event.candidate ? `${event.candidate.firstname} ${event.candidate.lastname}` : "profile"} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-white truncate">
                                                                        {event.candidate ? `${event.candidate.firstname} ${event.candidate.lastname}` : "Unknown profile"}
                                                                    </p>
                                                                    <p className="text-[11px] text-neutral-500 truncate">
                                                                        {formatEventLabel(event.action)} • {formatEventTime(event.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {event.candidate && (
                                                                <Link to={`/public-profile/${event.candidate.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/80 hover:text-cyan-200">
                                                                    View
                                                                </Link>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-3">
                                        {savedProfiles.length === 0 && (
                                            <div className="text-neutral-500 text-sm py-12 text-center rounded-3xl border border-white/5 bg-white/[0.03]">
                                                No saved profiles yet.
                                            </div>
                                        )}
                                        {savedProfiles.map((item) => (
                                            <div key={item.id} className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                                                        <img src={avatar(item.candidate?.imageUrl)} alt={`${item.candidate?.firstname} ${item.candidate?.lastname}`} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-base font-semibold text-white truncate">
                                                            {item.candidate.firstname} {item.candidate.lastname}
                                                        </p>
                                                        <p className="text-[12px] text-neutral-400 truncate">
                                                            {item.candidate.expertise?.aboutYou || item.candidate.expertise?.description || "Saved from recommendations"}
                                                        </p>
                                                        <p className="text-[11px] text-neutral-500 mt-1">Saved on {formatEventTime(item.savedAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/public-profile/${item.candidate.id}`} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10">
                                                        View
                                                    </Link>
                                                    <button onClick={() => handleSendFromSaved(item.candidate.id)} className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200">
                                                        Connect
                                                    </button>
                                                    <button onClick={() => handleRemoveSaved(item.candidate.id)} className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500/20">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {snack && (
                    <motion.div initial={{ opacity: 0, y: 30, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 30, x: "-50%" }} className="fixed bottom-12 left-1/2 z-[100] px-10 py-5 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20">
                        {snack}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function InsightCard({ label, value, icon, onView }) {
    return (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-neutral-500 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            {onView && (
                <button
                    onClick={onView}
                    className="mt-4 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10"
                >
                    Show
                </button>
            )}
        </div>
    );
}

function BreakdownCard({ title, items, formatter = (value) => value }) {
    return (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400 mb-4">{title}</h4>
            <div className="space-y-3">
                {(!items || items.length === 0) && <p className="text-sm text-neutral-500">No data yet.</p>}
                {(items || []).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                        <span className="text-sm text-neutral-300">{formatter(label)}</span>
                        <span className="text-sm font-black text-white">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BreakdownInline({ label, items, formatter = (value) => value }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400 mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
                {(!items || items.length === 0) && <span className="text-sm text-neutral-500">No data yet.</span>}
                {(items || []).map(([itemLabel, value]) => (
                    <span key={itemLabel} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[11px] text-neutral-200">
                        {formatter(itemLabel)}: {value}
                    </span>
                ))}
            </div>
        </div>
    );
}

function TrendCard({ title, trend = [] }) {
    return (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400 mb-4">{title}</h4>
            <div className="space-y-3">
                {(trend || []).slice(-7).map((day) => (
                    <div key={day.date} className="rounded-2xl bg-black/20 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-white">{day.date}</span>
                            <span className="text-[11px] text-neutral-400">
                                {day.shown} shown • {day.interested} interested • {day.saved} saved
                            </span>
                        </div>
                    </div>
                ))}
                {(!trend || trend.length === 0) && <p className="text-sm text-neutral-500">No trend data yet.</p>}
            </div>
        </div>
    );
}

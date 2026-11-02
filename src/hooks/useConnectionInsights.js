/** Smart-connection insight panels: history, preferences, saved profiles and analytics state + loaders. */
import { useState, useMemo } from "react";
import * as connectionsApi from "../api/connections";
import {
    createEmptyHistoryData,
    createEmptyPreferencesData,
    createEmptyAnalyticsData,
    createEmptyAdminAnalytics,
} from "../utils/connectionLogicDefaults";

/**
 * @param {object} args
 * @param {{ current: string|null }} args.ownerIdRef signed-in user the loaders are working for
 * @param {(ownerId: string|null) => boolean} args.isStaleFor true when a response belongs to a previous account
 * @param {(value: boolean) => void} args.setPanelLoading panel spinner setter
 * @param {boolean} [args.isAdmin] platform-wide analytics are admin-only on the server (403 for everyone else)
 * @param {{ current: string|null }} [args.activePanelRef] the open insight panel ("dashboard" | "history" | "saved"), if any
 */
export const useConnectionInsights = ({ ownerIdRef, isStaleFor, setPanelLoading, isAdmin = false, activePanelRef }) => {
    const [historyData, setHistoryData] = useState(createEmptyHistoryData);
    const [preferencesData, setPreferencesData] = useState(createEmptyPreferencesData);
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(createEmptyAnalyticsData);
    const [adminAnalytics, setAdminAnalytics] = useState(createEmptyAdminAnalytics);

    const preferredIds = useMemo(
        () => new Set((preferencesData.interested || []).map((p) => p.candidateUserId || p.candidate?.id || p.id)),
        [preferencesData.interested],
    );
    const notPreferredIds = useMemo(
        () => new Set((preferencesData.notInterested || []).map((p) => p.candidateUserId || p.candidate?.id || p.id)),
        [preferencesData.notInterested],
    );
    const savedCandidateIds = useMemo(
        () => new Set(savedProfiles.map((item) => item?.candidate?.id).filter(Boolean)),
        [savedProfiles],
    );

    const fetchHistory = async ({ silent = false } = {}) => {
        const ownerId = ownerIdRef.current;
        if (!silent) setPanelLoading(true);
        try {
            const data = await connectionsApi.getSmartUsersHistory();
            if (isStaleFor(ownerId)) return;
            setHistoryData(data || createEmptyHistoryData());
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchSavedProfiles = async ({ silent = false } = {}) => {
        const ownerId = ownerIdRef.current;
        if (!silent) setPanelLoading(true);
        try {
            const data = await connectionsApi.getSavedProfiles();
            if (isStaleFor(ownerId)) return;
            setSavedProfiles(data?.savedProfiles || []);
        } catch (err) {
            console.error("Failed to fetch saved profiles:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchPreferences = async ({ silent = false } = {}) => {
        const ownerId = ownerIdRef.current;
        if (!silent) setPanelLoading(true);
        try {
            const [preferred, notPreferred] = await Promise.all([
                connectionsApi.getPreferredUsers(),
                connectionsApi.getNotPreferredUsers(),
            ]);
            if (isStaleFor(ownerId)) return;
            setPreferencesData({
                interested: preferred || [],
                notInterested: notPreferred || [],
                counts: {
                    interested: (preferred || []).length,
                    notInterested: (notPreferred || []).length,
                },
            });
        } catch (err) {
            console.error("Failed to fetch preferences:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchAnalytics = async ({ silent = false } = {}) => {
        const ownerId = ownerIdRef.current;
        if (!silent) setPanelLoading(true);
        try {
            const data = await connectionsApi.getSmartUsersAnalytics();
            if (isStaleFor(ownerId)) return;
            setAnalyticsData(data || analyticsData);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    const fetchAdminAnalytics = async ({ silent = false } = {}) => {
        const ownerId = ownerIdRef.current;
        if (!silent) setPanelLoading(true);
        try {
            const data = await connectionsApi.getAdminAnalytics();
            if (isStaleFor(ownerId)) return;
            setAdminAnalytics(data || adminAnalytics);
        } catch (err) {
            console.error("Failed to fetch admin analytics:", err);
        } finally {
            if (!silent) setPanelLoading(false);
        }
    };

    // After a card or list action. Saved profiles and preferences drive the card badges, so they always
    // reload; history and analytics are only shown in their panels, which load them when opened, so they
    // reload only while that panel is open (this used to send six requests on every swipe)
    const refreshInsights = () => {
        const panel = activePanelRef?.current;
        fetchSavedProfiles({ silent: true });
        fetchPreferences({ silent: true });
        if (panel === "history") fetchHistory({ silent: true });
        if (panel === "dashboard") {
            fetchAnalytics({ silent: true });
            if (isAdmin) fetchAdminAnalytics({ silent: true });
        }
    };

    return {
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
    };
};

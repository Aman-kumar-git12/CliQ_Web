/** Which insight panel (dashboard / history / saved) is open, kept in sync with the URL, and its data loading. */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPanelFromUrl, getUrlFromPanel } from "../utils/connectionLogicDefaults";

/**
 * @param {object} args
 * @param {boolean} args.isAdmin admins also load platform-wide analytics on the dashboard
 * @param {object} args.loaders panel loaders from useConnectionInsights
 * @param {() => void} args.loaders.fetchAnalytics
 * @param {() => void} args.loaders.fetchAdminAnalytics
 * @param {() => void} args.loaders.fetchHistory
 * @param {(options?: { silent?: boolean }) => void} args.loaders.fetchPreferences
 * @param {() => void} args.loaders.fetchSavedProfiles
 */
export const useConnectionPanel = ({ isAdmin, loaders }) => {
    const { panel } = useParams();
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState(null);
    const { fetchAnalytics, fetchAdminAnalytics, fetchHistory, fetchPreferences, fetchSavedProfiles } = loaders;

    const updateActivePanel = (newPanel) => {
        setActivePanel(newPanel);
        const urlSegment = getUrlFromPanel(newPanel);
        if (urlSegment) {
            navigate(`/find/getconnection/${urlSegment}`, { replace: true });
        } else {
            navigate("/find/getconnection", { replace: true });
        }
    };

    useEffect(() => {
        const targetPanel = getPanelFromUrl(panel);
        if (targetPanel !== activePanel) setActivePanel(targetPanel);
        // The URL drives the panel; activePanel is read only to skip a no-op update
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panel]);

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

    return { activePanel, updateActivePanel };
};

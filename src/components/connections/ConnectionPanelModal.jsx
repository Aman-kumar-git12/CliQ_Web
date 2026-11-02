import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ConnectionDashboard from "./ConnectionDashboard";
import ConnectionHistory from "./ConnectionHistory";
import ConnectionSaved from "./ConnectionSaved";
import ConnectionPanelShimmering from "../shimmering/ConnectionPanelShimmering";
import { formatSectionTitle } from "../../utils/connectionPageHelpers";

/**
 * Full-screen dialog for the Dashboard / History / Saved panels, rendered into document.body.
 * @param {{ logic: ReturnType<typeof import("../../hooks/useConnectionLogic").useConnectionLogic> }} props
 */
export default function ConnectionPanelModal({ logic }) {
    const {
        activePanel,
        selectedSection,
        actionInProgress,
        panelLoading,
        historyData,
        preferencesData,
        savedProfiles,
        analyticsData,
        adminAnalytics,
        isAdmin,
        updateActivePanel,
        setSelectedSection,
        handleRemoveSaved,
        handleSendFromSaved,
        handleResetSection,
        handleActionFromList,
        handleRemoveSectionItem,
    } = logic;

    return createPortal(
        <AnimatePresence>
            {activePanel && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="connections-panel-title"
                        className="bg-neutral-950 w-full max-w-5xl max-h-[86vh] rounded-[36px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md">
                            <div>
                                <h3
                                    id="connections-panel-title"
                                    className="text-xl font-black uppercase italic tracking-tighter text-white"
                                >
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
                                        ? "Inspect recommendation quality and engine-wide trends."
                                        : activePanel === "history"
                                          ? selectedSection
                                              ? "Profiles currently grouped under this section."
                                              : "Track recommendation actions and preference trends."
                                          : "Profiles you saved from smart recommendations."}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close panel"
                                onClick={() => updateActivePanel(null)}
                                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {panelLoading ? (
                                <ConnectionPanelShimmering panel={activePanel} />
                            ) : activePanel === "dashboard" ? (
                                <ConnectionDashboard
                                    analyticsData={analyticsData}
                                    adminAnalytics={adminAnalytics}
                                    isAdmin={isAdmin}
                                />
                            ) : activePanel === "history" ? (
                                <ConnectionHistory
                                    historyData={historyData}
                                    preferencesData={preferencesData}
                                    selectedSection={selectedSection}
                                    setSelectedSection={setSelectedSection}
                                    handleResetSection={handleResetSection}
                                    handleActionFromList={handleActionFromList}
                                    handleRemoveSectionItem={handleRemoveSectionItem}
                                    actionInProgress={actionInProgress}
                                />
                            ) : (
                                <ConnectionSaved
                                    savedProfiles={savedProfiles}
                                    handleRemoveSaved={handleRemoveSaved}
                                    handleSendFromSaved={handleSendFromSaved}
                                />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

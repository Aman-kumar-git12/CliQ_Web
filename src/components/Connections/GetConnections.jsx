import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BarChart3, History, Bookmark } from "lucide-react";
import ConnectionCard from "./ConnectionCard";
import MatchCardShimmering from "../shimmering/MatchCardShimmering";

// Custom Hook & Sub-components
import { useConnectionLogic } from "./useConnectionLogic";
import ConnectionDashboard from "./ConnectionDashboard";
import ConnectionHistory from "./ConnectionHistory";
import ConnectionSaved from "./ConnectionSaved";
import { ConnectionExpertiseModal } from "./ConnectionModals";
import { ConnectionNudge } from "./ConnectionSharedUI";

const PLACEHOLDER_VALUES = new Set(["", "****", "professional seeker", "n/a", "na", "null", "undefined"]);

export default function GetConnections() {
    const {
        // State
        user, nextUser, loading, sending, isFetchingMore,
        showExpertise, activePanel, selectedSection, actionInProgress, panelLoading,
        savingProfile, snack, showCardMenu, historyData, preferencesData, savedProfiles,
        analyticsData, adminAnalytics, viewerProfile,
        
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
    } = useConnectionLogic();

    // --- Helpers (for local UI) ---
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
        const headline = [expertise.description, expertise.aboutYou, expertise.experience, expertise.name].find(isMeaningfulText) || "";
        const textFields = [expertise.description, expertise.aboutYou, expertise.experience, expertise.projects, expertise.achievements].filter(isMeaningfulText);
        const qualityScore = (headline ? 0.32 : 0) + Math.min(skills.length, 5) * 0.09 + Math.min(interests.length, 4) * 0.06 + Math.min(textFields.length, 4) * 0.08;
        return { qualityScore };
    };

    const getViewerProfileNudge = (expertise = {}) => {
        const signal = getProfileSignal(expertise);
        if (signal.qualityScore >= 0.42) return null;
        return "Complete your profile to improve the strength of your recommendations.";
    };

    const getConfidenceBadgeClass = (confidence = "") => {
        if (confidence.toLowerCase().includes("low")) return "text-amber-200/95 bg-amber-400/10 border-amber-400/25";
        if (confidence.toLowerCase().includes("high") || confidence.toLowerCase().includes("strong")) return "text-emerald-300/90 bg-emerald-400/10 border-emerald-400/20";
        return "text-cyan-200/90 bg-cyan-400/10 border-cyan-400/20";
    };

    const viewerProfileNudge = getViewerProfileNudge(viewerProfile?.expertise || {});

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

    if (loading) return <div className="grid place-items-center py-20"><MatchCardShimmering /></div>;

    return (
        <motion.div
            style={{ backgroundColor: bgGlow }}
            className="w-full relative min-h-[700px] grid place-items-center pt-20 pb-12 px-4 overflow-hidden rounded-[40px] transition-colors duration-500 bg-[#16161f]"
        >
            {!activePanel && <ConnectionNudge nudge={viewerProfileNudge} />}

            <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                <button
                    onClick={() => updateActivePanel("dashboard")}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <BarChart3 size={14} /> Dashboard
                </button>
                <button
                    onClick={() => updateActivePanel("history")}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <History size={14} /> History
                </button>
                <button
                    onClick={() => updateActivePanel("saved")}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-white/85 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <Bookmark size={14} /> Saved
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
                    <ConnectionExpertiseModal user={user} onClose={() => setShowExpertise(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activePanel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="bg-neutral-950 w-full max-w-5xl max-h-[86vh] rounded-[36px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                        {activePanel === "dashboard" ? "Recommendation Dashboard" : activePanel === "history" ? (selectedSection ? formatSectionTitle(selectedSection) : "Connection History") : "Saved Profiles"}
                                    </h3>
                                    <p className="text-[11px] text-neutral-400 mt-1">
                                        {activePanel === "dashboard" ? "Inspect recommendation quality and engine-wide trends." : activePanel === "history" ? (selectedSection ? "Profiles currently grouped under this section." : "Track recommendation actions and preference trends.") : "Profiles you saved from smart recommendations."}
                                    </p>
                                </div>
                                <button onClick={() => updateActivePanel(null)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {panelLoading ? (
                                    <div className="grid place-items-center py-20 text-neutral-500">Loading...</div>
                                ) : activePanel === "dashboard" ? (
                                    <ConnectionDashboard analyticsData={analyticsData} adminAnalytics={adminAnalytics} />
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

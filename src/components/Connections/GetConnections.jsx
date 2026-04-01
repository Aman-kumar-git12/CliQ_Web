import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BarChart3, History, Bookmark, Zap, ChevronDown } from "lucide-react";
import ConnectionCard from "./ConnectionCard";
import MatchCardShimmering from "../shimmering/MatchCardShimmering";

// Custom Hook & Sub-components
import { useConnectionLogic } from "./useConnectionLogic";
import ConnectionDashboard from "./ConnectionDashboard";
import ConnectionHistory from "./ConnectionHistory";
import ConnectionSaved from "./ConnectionSaved";
import { ConnectionExpertiseModal } from "./ConnectionModals";
import { ConnectionNudge } from "./ConnectionSharedUI";
import { createPortal } from "react-dom";

const PLACEHOLDER_VALUES = new Set(["", "****", "professional seeker", "n/a", "na", "null", "undefined"]);

export default function GetConnections() {
    const [matcherMenuOpen, setMatcherMenuOpen] = useState(false);
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

    return (
        <motion.div
            className="w-full relative min-h-screen flex flex-col items-center pt-1 md:pt-2 pb-24 md:pb-12 px-4 md:pl-0 md:pr-6 overflow-visible transition-colors duration-500"
        >
            {/* Top Navigation Bar: Integrated Alignment with Split Layout */}
            <div className="w-full max-w-full md:max-w-2xl flex flex-col items-start justify-start mb-4 md:mb-3 relative z-[120] px-4 md:px-0">
                <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="fill-[#8b5cf6]/20 text-[#8b5cf6]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Discovery Module</span>
                    </div>

                    {/* Mobile-Only Dropdown Trigger: Integrated with Branding Tag */}
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setMatcherMenuOpen(!matcherMenuOpen)}
                            className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all flex items-center gap-0.5"
                        >
                            <ChevronDown size={14} strokeWidth={3} className={`transition-transform duration-300 ${matcherMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {matcherMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-[#0a0a0c] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 p-1.5 z-[150] backdrop-blur-3xl"
                                >
                                    <button
                                        onClick={() => { updateActivePanel("dashboard"); setMatcherMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                    >
                                        <BarChart3 size={15} className="text-indigo-400" /> DASHBOARD
                                    </button>
                                    <button
                                        onClick={() => { updateActivePanel("history"); setMatcherMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                    >
                                        <History size={15} className="text-indigo-400" /> HISTORY
                                    </button>
                                    <button
                                        onClick={() => { updateActivePanel("saved"); setMatcherMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                                    >
                                        <Bookmark size={15} className="text-indigo-400" /> SAVED
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex flex-row items-end justify-between w-full">
                    <div className="flex flex-col">
                        <h1 className="text-[26px] md:text-[32px] font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                            Intelligence
                        </h1>
                        <span className="text-[20px] md:text-[26px] text-[#5f5a78] font-light uppercase italic leading-none -mt-1 block">
                            Matcher
                        </span>
                    </div>

                    {/* Desktop Controls Row: Hidden on Mobile */}
                    <div className="hidden md:flex items-center gap-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <button
                                onClick={() => updateActivePanel("dashboard")}
                                className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                            >
                                <BarChart3 size={13} /> DASHBOARD
                            </button>
                            <button
                                onClick={() => updateActivePanel("history")}
                                className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                            >
                                <History size={13} /> HISTORY
                            </button>
                            <button
                                onClick={() => updateActivePanel("saved")}
                                className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[8.5px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 shadow-xl backdrop-blur-md whitespace-nowrap"
                            >
                                <Bookmark size={13} /> SAVED
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center md:pl-0">
                {!activePanel && <ConnectionNudge nudge={viewerProfileNudge} />}

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="shimmer"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="w-full flex justify-center py-4 md:py-8"
                        >
                            <MatchCardShimmering />
                        </motion.div>
                    ) : !user ? (
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
            </div>

            {createPortal(
                <AnimatePresence>
                    {showExpertise && (
                        <ConnectionExpertiseModal user={user} onClose={() => setShowExpertise(false)} />
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
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
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {snack && (
                        <motion.div initial={{ opacity: 0, y: 30, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 30, x: "-50%" }} className="fixed bottom-12 left-1/2 z-[100] px-10 py-5 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20">
                            {snack}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
}

import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Bookmark, X, Send, Sparkles, Trash2, ShieldCheck, Check } from "lucide-react";
import { InsightCard } from "./ConnectionSharedUI";

const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
const formatEventTime = (value) => {
    try {
        return new Date(value).toLocaleString();
    } catch {
        return "";
    }
};
const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

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

const ConnectionHistory = ({ 
    historyData, 
    preferencesData, 
    selectedSection, 
    setSelectedSection, 
    handleResetSection, 
    handleActionFromList, 
    handleRemoveSectionItem, 
    actionInProgress 
}) => {
    if (selectedSection) {
        const data = selectedSection === "my_interest" 
            ? preferencesData.interested 
            : selectedSection === "not_preferred" 
                ? preferencesData.notInterested 
                : historyData.sections?.[selectedSection];
        
        const list = data || [];

        return (
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
                    {list.length === 0 && (
                        <div className="text-neutral-500 text-sm py-12 text-center rounded-3xl border border-white/5 bg-white/[0.03]">
                            No profiles in this section right now.
                        </div>
                    )}
                    {list.map((candidateOrItem) => {
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
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InsightCard label="Shown" value={historyData.counts?.shown || 0} icon={<BarChart3 size={16} />} onView={() => setSelectedSection("shown")} />
                <InsightCard label="Saved" value={historyData.counts?.saved || 0} icon={<Bookmark size={16} />} onView={() => setSelectedSection("saved")} />
                <InsightCard label="Ignored" value={historyData.counts?.ignored || 0} icon={<X size={16} />} onView={() => setSelectedSection("ignored")} />
                <InsightCard label="Interested" value={historyData.counts?.interested || 0} icon={<Send size={16} />} onView={() => setSelectedSection("interested")} />
                <InsightCard label="Preferred" value={preferencesData.counts?.interested || 0} icon={<Sparkles size={16} />} onView={() => setSelectedSection("my_interest")} />
                <InsightCard label="Not Preferred" value={preferencesData.counts?.notInterested || 0} icon={<Trash2 size={16} />} onView={() => setSelectedSection("not_preferred")} />
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
    );
};

export default ConnectionHistory;

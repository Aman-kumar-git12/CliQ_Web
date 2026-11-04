import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, X, Send, Sparkles, Trash2, ShieldCheck, Check, Inbox, History } from "lucide-react";
import { InsightCard } from "./ConnectionSharedUI";
import { avatarUrl } from "../../utils/avatar";
import ConfirmDialog from "../common/ConfirmDialog";

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
        case "saved":
            return "Saved";
        case "ignored":
            return "Ignored";
        case "interested":
            return "Interested";
        default:
            return action;
    }
};

const formatSectionTitle = (action) => {
    switch (action) {
        case "saved":
            return "Saved Profiles";
        case "ignored":
            return "Ignored Profiles";
        case "interested":
            return "Interested Profiles";
        case "my_interest":
            return "My Current Interest";
        case "not_preferred":
            return "Not Preferred";
        default:
            return "Profiles";
    }
};

const getSectionActionLabel = (action) => {
    switch (action) {
        case "saved":
            return "Unsave";
        case "ignored":
            return "Remove Ignore";
        case "interested":
            return "Remove Interest";
        case "my_interest":
            return "Remove Interest";
        case "not_preferred":
            return "Remove Not Preferred";
        default:
            return "Remove";
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
    actionInProgress,
}) => {
    const [confirmReset, setConfirmReset] = useState(false);

    if (selectedSection) {
        const data =
            selectedSection === "my_interest"
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
                        className="px-4 py-2 rounded-xl border border-line bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 hover:text-white cliq-press focus-ring"
                    >
                        Back To Summary
                    </button>
                    {selectedSection !== "ignored" && selectedSection !== "interested" && (
                        <button
                            onClick={() => setConfirmReset(true)}
                            className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-red-300 hover:bg-red-500/20 cliq-press focus-ring"
                        >
                            Reset Section
                        </button>
                    )}
                </div>

                <ConfirmDialog
                    isOpen={confirmReset}
                    onClose={() => setConfirmReset(false)}
                    onConfirm={() => {
                        setConfirmReset(false);
                        handleResetSection(selectedSection);
                    }}
                    title="Reset this list?"
                    message="Everyone in this list will be removed from it. This can't be undone."
                    confirmText="Yes, Reset"
                />
                <div className="space-y-3">
                    {list.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-14 text-center rounded-3xl border border-dashed border-line bg-white/[0.02]">
                            <span className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light">
                                <Inbox size={20} />
                            </span>
                            <p className="text-sm text-ink-300">No profiles in this section right now.</p>
                        </div>
                    )}
                    {list.map((candidateOrItem) => {
                        const candidate = candidateOrItem.candidate || candidateOrItem;
                        const recordedAt = candidateOrItem.recordedAt || candidateOrItem.updatedAt || new Date();
                        return (
                            <div
                                key={candidate.id}
                                className="rounded-3xl border border-line-soft bg-white/[0.03] p-3.5 md:p-4 flex flex-col md:flex-row md:items-center gap-4 md:justify-between transition-colors duration-150 ease-soft hover:bg-white/[0.05] hover:border-line group/historyCard"
                            >
                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-surface-600 shrink-0 border border-white/5">
                                        <img
                                            loading="lazy"
                                            decoding="async"
                                            src={avatarUrl(candidate?.imageUrl)}
                                            alt={`${candidate?.firstname} ${candidate?.lastname}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[15px] md:text-base font-semibold text-white truncate">
                                            {candidate.firstname} {candidate.lastname}
                                        </p>
                                        <p className="text-[11px] md:text-[12px] text-ink-300 truncate mt-0.5">
                                            {candidate.expertise?.aboutYou ||
                                                candidate.expertise?.description ||
                                                formatSectionTitle(selectedSection)}
                                        </p>
                                        <p className="text-[10px] md:text-[11px] text-ink-400 mt-1 uppercase tracking-wider">
                                            {formatEventLabel(selectedSection)} • {formatEventTime(recordedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 mt-4 md:mt-0">
                                    {selectedSection === "saved" && (
                                        <>
                                            <button
                                                disabled={actionInProgress.has(candidate.id)}
                                                onClick={() => handleActionFromList("preferred", candidate.id)}
                                                className={`px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300/70 hover:bg-emerald-500/10 hover:text-emerald-300 cliq-press focus-ring ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                Preferred
                                            </button>
                                            <button
                                                disabled={actionInProgress.has(candidate.id)}
                                                onClick={() => handleActionFromList("not_preferred", candidate.id)}
                                                className={`px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-red-300/70 hover:bg-red-500/10 hover:text-red-300 cliq-press focus-ring ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                Not Preferred
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        to={`/public-profile/${candidate.id}`}
                                        className="px-3 py-2 rounded-xl border border-line bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white/70 hover:bg-white/10 hover:text-white cliq-press focus-ring text-center flex items-center justify-center"
                                    >
                                        View
                                    </Link>
                                    <button
                                        disabled={actionInProgress.has(candidate.id)}
                                        onClick={() => handleRemoveSectionItem(selectedSection, candidate.id)}
                                        className={`px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-red-300/70 hover:bg-red-500/10 hover:text-red-300 cliq-press focus-ring ${actionInProgress.has(candidate.id) ? "opacity-50 cursor-not-allowed" : ""}`}
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
                <InsightCard
                    label="Saved"
                    value={historyData.counts?.saved || 0}
                    icon={<Bookmark size={16} />}
                    onView={() => setSelectedSection("saved")}
                />
                <InsightCard
                    label="Ignored"
                    value={historyData.counts?.ignored || 0}
                    icon={<X size={16} />}
                    onView={() => setSelectedSection("ignored")}
                />
                <InsightCard
                    label="Interested"
                    value={historyData.counts?.interested || 0}
                    icon={<Send size={16} />}
                    onView={() => setSelectedSection("interested")}
                />
                <InsightCard
                    label="Preferred"
                    value={preferencesData.counts?.interested || 0}
                    icon={<Sparkles size={16} />}
                    onView={() => setSelectedSection("my_interest")}
                />
                <InsightCard
                    label="Not Preferred"
                    value={preferencesData.counts?.notInterested || 0}
                    icon={<Trash2 size={16} />}
                    onView={() => setSelectedSection("not_preferred")}
                />
                <InsightCard
                    label="Interest Rate"
                    value={formatPercent(historyData.conversion?.interestRate)}
                    icon={<ShieldCheck size={16} />}
                />
                <InsightCard
                    label="Save Rate"
                    value={formatPercent(historyData.conversion?.saveRate)}
                    icon={<Check size={16} />}
                />
            </div>

            <div className="rounded-3xl border border-line-soft bg-white/[0.03] p-5">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                    {(historyData.timeline || []).length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <span className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light">
                                <History size={20} />
                            </span>
                            <p className="text-sm text-ink-300">No recommendation history yet.</p>
                        </div>
                    )}
                    {(historyData.timeline || []).map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 transition-colors duration-150 ease-soft hover:bg-white/[0.03]"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-600 shrink-0">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src={avatarUrl(event.candidate?.imageUrl)}
                                        alt={
                                            event.candidate
                                                ? `${event.candidate.firstname} ${event.candidate.lastname}`
                                                : "profile"
                                        }
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {event.candidate
                                            ? `${event.candidate.firstname} ${event.candidate.lastname}`
                                            : "Unknown profile"}
                                    </p>
                                    <p className="text-[11px] text-ink-400 truncate">
                                        {formatEventLabel(event.action)} • {formatEventTime(event.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {event.candidate && (
                                <Link
                                    to={`/public-profile/${event.candidate.id}`}
                                    className="shrink-0 rounded-md text-[10px] font-black uppercase tracking-[0.2em] text-brand-light/90 hover:text-brand-light transition-colors duration-150 ease-soft focus-ring"
                                >
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

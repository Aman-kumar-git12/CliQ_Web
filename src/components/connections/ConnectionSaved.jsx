import { Link } from "react-router-dom";
import { Bookmark, Trash2 } from "lucide-react";
import { avatarUrl } from "../../utils/avatar";

const formatEventTime = (value) => {
    try {
        return new Date(value).toLocaleString();
    } catch {
        return "";
    }
};

const ConnectionSaved = ({ savedProfiles, handleRemoveSaved, handleSendFromSaved }) => {
    return (
        <div className="space-y-3">
            {savedProfiles.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-14 text-center rounded-3xl border border-dashed border-line bg-white/[0.02]">
                    <span className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light">
                        <Bookmark size={20} />
                    </span>
                    <p className="text-sm text-ink-300">No saved profiles yet.</p>
                </div>
            )}
            {savedProfiles.map((item) => (
                <div
                    key={item.id}
                    className="rounded-3xl border border-line-soft bg-white/[0.03] p-4 transition-colors duration-150 ease-soft hover:bg-white/[0.05] hover:border-line flex flex-col md:flex-row md:items-center gap-4 md:justify-between"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-600 shrink-0">
                            <img
                                loading="lazy"
                                decoding="async"
                                src={avatarUrl(item.candidate?.imageUrl)}
                                alt={`${item.candidate?.firstname} ${item.candidate?.lastname}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-semibold text-white truncate">
                                {item.candidate.firstname} {item.candidate.lastname}
                            </p>
                            <p className="text-[12px] text-ink-300 truncate">
                                {item.candidate.expertise?.aboutYou ||
                                    item.candidate.expertise?.description ||
                                    "Saved from recommendations"}
                            </p>
                            <p className="text-[11px] text-ink-400 mt-1">Saved on {formatEventTime(item.savedAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/public-profile/${item.candidate.id}`}
                            className="px-4 py-2 rounded-xl border border-line bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 hover:text-white cliq-press focus-ring"
                        >
                            View
                        </Link>
                        <button
                            onClick={() => handleSendFromSaved(item.candidate.id)}
                            className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 cliq-press focus-ring"
                        >
                            Connect
                        </button>
                        <button
                            type="button"
                            aria-label="Remove from saved"
                            onClick={() => handleRemoveSaved(item.candidate.id)}
                            className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500/20 active:scale-95 cliq-transition focus-ring"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConnectionSaved;

import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";
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
                        <button onClick={() => handleSendFromSaved(item.candidate.id)} className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-200 transition-colors">
                            Connect
                        </button>
                        <button onClick={() => handleRemoveSaved(item.candidate.id)} className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConnectionSaved;

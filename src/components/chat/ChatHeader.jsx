/** Chat page header: back button, the other user's avatar, name and online status. */
import { ArrowLeft } from "lucide-react";
import { DEFAULT_AVATAR } from "../../utils/avatar";

const ChatHeader = ({ targetUser, isTargetOnline, onBack }) => (
    <header className="flex items-center justify-between pl-2 pr-6 py-4 bg-surface-900/70 backdrop-blur-2xl border-b border-line-soft shrink-0 z-20 h-[88px] shadow-soft">
        <div className="flex items-center gap-2 min-w-0">
            <button
                type="button"
                aria-label="Back to messages"
                onClick={onBack}
                className="p-2 -ml-1 mr-2 text-white/50 hover:bg-white/[0.06] hover:text-white rounded-full transition duration-150 ease-soft active:scale-95 group focus-ring"
            >
                <ArrowLeft
                    size={24}
                    strokeWidth={2.5}
                    className="group-hover:-translate-x-0.5 transition-transform duration-150 ease-soft"
                />
            </button>
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative group cursor-pointer shrink-0">
                    <div className="w-[56px] h-[56px] rounded-[22px] overflow-hidden p-[2px] bg-gradient-to-br from-brand/90 to-brand-pink/80 shadow-lg shadow-brand/10 transition-transform duration-200 ease-soft group-hover:scale-[1.03]">
                        <img
                            src={targetUser?.imageUrl || DEFAULT_AVATAR}
                            alt={[targetUser?.firstname, targetUser?.lastname].filter(Boolean).join(" ") || "User"}
                            className="w-full h-full rounded-[20px] object-cover bg-surface-850"
                        />
                    </div>
                    {isTargetOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-surface-900 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.35)] z-20">
                            <div className="absolute inset-0 bg-white/30 rounded-full motion-safe:animate-ping" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <h2 className="text-[19px] font-black text-white tracking-tighter leading-none mb-1.5 uppercase italic truncate">
                        {targetUser?.firstname} {targetUser?.lastname}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isTargetOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" : "bg-white/15"}`}
                        />
                        <p
                            className={`text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 ${isTargetOnline ? "text-emerald-400" : "text-ink-300"}`}
                        >
                            {isTargetOnline ? "Active Now" : "Offline"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

export default ChatHeader;

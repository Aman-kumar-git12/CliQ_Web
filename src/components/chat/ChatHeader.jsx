/** Chat page header: back button, the other user's avatar, name and online status. */
import { ArrowLeft } from "lucide-react";
import { DEFAULT_AVATAR } from "../../utils/avatar";

const ChatHeader = ({ targetUser, isTargetOnline, onBack }) => (
    <header className="flex items-center justify-between pl-2 pr-6 py-4 bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 shrink-0 z-20 h-[88px] shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2">
            <button
                type="button"
                aria-label="Back to messages"
                onClick={onBack}
                className="p-2 -ml-1 mr-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-all active:scale-95 group"
            >
                <ArrowLeft size={24} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                    <div className="w-[56px] h-[56px] rounded-[24px] overflow-hidden border border-white/20 p-[2px] bg-gradient-to-br from-brand to-brand-pink shadow-2xl transition-all duration-500 group-hover:scale-105">
                        <img
                            src={targetUser?.imageUrl || DEFAULT_AVATAR}
                            alt={[targetUser?.firstname, targetUser?.lastname].filter(Boolean).join(" ") || "User"}
                            className="w-full h-full rounded-[21px] object-cover bg-surface-850"
                        />
                    </div>
                    {isTargetOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#10b981] border-[3px] border-surface-850 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20">
                            <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[19px] font-black text-white tracking-tighter leading-none mb-1.5 uppercase italic">
                        {targetUser?.firstname} {targetUser?.lastname}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${isTargetOnline ? "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"}`}
                        />
                        <p
                            className={`text-[9px] font-black tracking-[0.25em] uppercase transition-colors ${isTargetOnline ? "text-[#10b981]" : "text-white/20"}`}
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

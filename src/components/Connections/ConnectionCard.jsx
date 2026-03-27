import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShieldCheck, Bookmark, MoreVertical } from "lucide-react";

const ConnectionCard = ({
    user,
    isPreferred,
    isNotPreferred,
    dragX,
    rotate,
    rotateX,
    rotateY,
    transformOrigin,
    controls,
    sending,
    likeOpacity,
    nopeOpacity,
    likeScale,
    nopeScale,
    showCardMenu,
    setShowCardMenu,
    handleMarkPreferred,
    handleMarkNotPreferred,
    handleSaveProfile,
    savedCandidateIds,
    savingProfile,
    setShowExpertise,
    handleIgnore,
    handleInterested,
    isFetchingMore,
    getConfidenceBadgeClass,
    handleMouseMove,
    handleMouseLeave,
    handleDragEnd,
    avatar
}) => {
    return (
        <div className="relative w-full max-w-[24rem] sm:max-w-md z-20 group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* Dynamic Background Words */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 transition-opacity group-hover:opacity-10">
                <span className="absolute top-[20%] left-[-10%] text-6xl font-black text-white italic -rotate-12">DISCOVERY</span>
                <span className="absolute bottom-[20%] right-[-10%] text-6xl font-black text-white italic rotate-12">NETWORK</span>
            </div>

            <motion.div
                key={user.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                dragElastic={0.8}
                whileTap={{ scale: 0.98 }}
                animate={sending ? controls : { scale: 1, opacity: 1, y: 0, x: 0 }}
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                style={{ x: dragX, rotate, rotateX, rotateY, transformOrigin, touchAction: "none" }}
                className="w-full relative rounded-[32px] overflow-hidden flex flex-col cursor-grab active:cursor-grabbing h-[520px] border border-white/[0.07] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]"
            >
                {/* Pure dark glassmorphism background */}
                <div className="absolute inset-0 bg-[#0d0d0f] z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-transparent to-violet-950/30 z-0" />

                {/* Ambient top glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none z-0" />

                {/* Swipe Stamps */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-5 z-50 -rotate-12 bg-emerald-500 shadow-[0_0_24px_rgba(34,197,94,0.6)] text-white px-5 py-1.5 rounded-xl font-black text-sm tracking-[0.1em] uppercase border border-emerald-400/30 pointer-events-none">LIKE</motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-6 right-5 z-50 rotate-12 bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.6)] text-white px-5 py-1.5 rounded-xl font-black text-sm tracking-[0.1em] uppercase border border-red-400/30 pointer-events-none">NOPE</motion.div>

                {/* More Options Menu */}
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCardMenu(!showCardMenu);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                        {showCardMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
                                className="absolute top-12 right-0 w-48 bg-[#1a1a22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleMarkPreferred(); }}
                                    disabled={isPreferred || isNotPreferred || sending}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors group ${
                                        isPreferred ? "opacity-100 cursor-default bg-white/5" : "hover:bg-white/5"
                                    } ${isNotPreferred ? "opacity-40" : ""}`}
                                >
                                    <div className={`p-1.5 rounded-lg ${
                                        isPreferred ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                                    }`}>
                                        <Check size={14} strokeWidth={isPreferred ? 3 : 2} />
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isPreferred ? "text-emerald-400" : "text-white/80"}`}>
                                        {isPreferred ? "Marked Preferred" : "Preferred"}
                                    </span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleMarkNotPreferred(); }}
                                    disabled={isPreferred || isNotPreferred || sending}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors group ${
                                        isNotPreferred ? "opacity-100 cursor-default bg-white/5" : "hover:bg-white/5"
                                    } ${isPreferred ? "opacity-40" : ""}`}
                                >
                                    <div className={`p-1.5 rounded-lg ${
                                        isNotPreferred ? "bg-red-500/30 text-red-300" : "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
                                    }`}>
                                        <X size={14} strokeWidth={isNotPreferred ? 3 : 2} />
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isNotPreferred ? "text-red-400" : "text-white/80"}`}>
                                        {isNotPreferred ? "Marked Not Preferred" : "Not Preferred"}
                                    </span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleSaveProfile(); }}
                                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors group border-t border-white/5"
                                >
                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                                        <Bookmark size={14} />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Save Profile</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center h-full pt-10 px-7 pb-7">

                    {/* Large nebula glow avatar */}
                    <div className="relative mb-6 shrink-0">
                        <div className="absolute inset-[-12px] rounded-full bg-gradient-to-tr from-cyan-500/30 via-violet-500/40 to-pink-500/30 blur-[18px] animate-pulse" />
                        <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tl from-blue-400/20 via-purple-500/30 to-fuchsia-400/20 blur-[10px]" />

                        <div className="w-32 h-32 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.4)] relative z-10">
                            <div className="w-full h-full rounded-full bg-[#0d0d0f] p-[2px]">
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover" draggable="false" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-[3px] border-[#0d0d0f] rounded-full z-20 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>

                    {/* Name */}
                    <div className="text-center mb-1">
                        <h2 className="text-[28px] font-black text-white tracking-[0.05em] uppercase leading-none" style={{ fontVariant: 'small-caps' }}>
                            {user.firstname} {user.lastname}
                        </h2>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-5">
                        {user.matchConfidence && (
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] border px-2.5 py-0.5 rounded-full ${getConfidenceBadgeClass(user.matchConfidence)}`}>
                                {user.matchConfidence}
                            </span>
                        )}
                        {user.selectionMode === "explore" && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/90 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full">
                                Explore
                            </span>
                        )}
                        {user.profileQualityLabel && (
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${user.profileQualityScore < 0.42 ? "text-amber-200/90 bg-amber-400/10 border-amber-400/20" : "text-white/80 bg-white/5 border-white/10"}`}>
                                {user.profileQualityLabel}
                            </span>
                        )}
                        {user.expertise?.skills?.[0] && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                                {user.expertise.skills[0]}
                            </span>
                        )}
                        {user.age && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80 bg-violet-500/10 border border-violet-400/20 px-2.5 py-0.5 rounded-full">
                                {user.age} Yrs
                            </span>
                        )}
                        <ShieldCheck size={16} className="text-blue-400 ml-0.5" />
                    </div>

                    {/* Bio */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full px-3 gap-3">
                        {user.matchReason && (
                            <div className="w-full rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-300/75 mb-1">Why this match</p>
                                <p className="text-[12px] text-cyan-100/85 leading-[1.5] text-center">{user.matchReason}</p>
                                {user.matchWarning && (
                                    <p className="text-[10px] text-amber-200/80 leading-[1.5] text-center mt-2">{user.matchWarning}</p>
                                )}
                            </div>
                        )}
                        {user.matchConfidence?.toLowerCase().includes("low") && !user.matchWarning && (
                            <div className="w-full rounded-2xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/75 mb-1">Low-Data Warning</p>
                                <p className="text-[12px] text-amber-50/85 leading-[1.5] text-center">
                                    This recommendation is more exploratory because the available profile signal is limited.
                                </p>
                            </div>
                        )}
                        <p className="text-[13px] text-neutral-400 leading-[1.65] italic text-center line-clamp-3">
                            &ldquo;{user.expertise?.aboutYou || "Looking for meaningful connections and opportunities to grow together."}&rdquo;
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full mt-4 flex items-center justify-between gap-3" onPointerDown={(e) => e.stopPropagation()}>
                        <motion.button
                            style={{ scale: nopeScale }}
                            onClick={handleIgnore}
                            disabled={sending}
                            whileHover={{ scale: 1.12, boxShadow: "0 0 24px rgba(239,68,68,0.4)" }}
                            whileTap={{ scale: 0.82 }}
                            className="w-14 h-14 flex items-center justify-center rounded-full text-red-400 border border-red-500/40 bg-red-500/10 transition-all duration-200 disabled:opacity-40 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                        >
                            <X size={22} strokeWidth={2.5} />
                        </motion.button>

                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-200 ${savedCandidateIds.has(user.id) ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"} disabled:opacity-40`}
                        >
                            <Bookmark size={18} fill={savedCandidateIds.has(user.id) ? "currentColor" : "none"} />
                        </button>

                        <button
                            onClick={() => setShowExpertise(true)}
                            className="px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.3em] text-violet-400/80 hover:text-violet-200 transition-all duration-200 active:scale-95"
                            style={{
                                background: "rgba(139,92,246,0.08)",
                                border: "1px solid rgba(139,92,246,0.25)",
                            }}
                        >
                            View Intel
                        </button>

                        <motion.button
                            style={{ scale: likeScale }}
                            onClick={handleInterested}
                            disabled={sending}
                            whileHover={{ scale: 1.12, boxShadow: "0 0 35px rgba(255,255,255,0.35)" }}
                            whileTap={{ scale: 0.82 }}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black shadow-[0_4px_25px_rgba(255,255,255,0.2)] disabled:opacity-40 cursor-pointer"
                        >
                            <Check size={22} strokeWidth={3} />
                        </motion.button>
                    </div>

                    {isFetchingMore && (
                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/65">
                            Refreshing next matches...
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ConnectionCard;

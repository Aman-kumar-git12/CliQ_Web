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
        <div className="relative w-full max-w-full sm:max-w-md md:max-w-md z-20 group mx-auto md:mx-0" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div
                key={user.id}
                drag="x"
                onDragEnd={handleDragEnd}
                dragElastic={0.8}
                whileTap={{ scale: 0.98 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                style={{ x: dragX, rotate, rotateX, rotateY, transformOrigin, touchAction: "none" }}
                className="w-full relative rounded-[28px] md:rounded-[40px] flex flex-col cursor-grab active:cursor-grabbing min-h-[480px] md:min-h-[600px] p-[1px] md:p-[1.5px] bg-gradient-to-b from-white/10 via-white/5 to-white/5 shadow-[0_45px_100px_-20px_rgba(0,0,0,1)] group/card"
            >
                {/* Visual Highlight Border - Cyber-style */}
                <div className="absolute inset-0 rounded-[40px] p-[1px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-20 group-hover/card:opacity-60 transition-opacity duration-500 z-0" />

                <div className="relative w-full flex-1 bg-[#0f0e1a] rounded-[27px] md:rounded-[39px] overflow-hidden flex flex-col z-10 border border-white/10">
                    {/* Shimmering Surface Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover/card:animate-[shimmer_3s_infinite] pointer-events-none" />

                    {/* Highly refined accent glow at top */}
                    <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[140%] h-[40%] bg-indigo-500/20 rounded-[100%] blur-[100px] pointer-events-none z-0" />

                    {/* Swipe Stamps - Enhanced High-Visibility */}
                    <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 z-50 -rotate-12 px-6 py-2 rounded-2xl bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.8)] text-white font-black text-[10px] tracking-[0.2em] uppercase pointer-events-none backdrop-blur-xl scale-110">INTERESTED</motion.div>
                    <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 z-50 rotate-12 px-6 py-2 rounded-2xl bg-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase pointer-events-none border border-white/20 backdrop-blur-xl shadow-2xl">IGNORE</motion.div>

                    {/* Options Menu Button - Glassy Highlight */}
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCardMenu(!showCardMenu);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.15] border border-white/20 text-white/50 hover:text-white transition-all duration-300 shadow-xl"
                        >
                            <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                            {showCardMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute top-12 right-0 w-56 bg-black/95 backdrop-blur-3xl border border-white/20 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-3 z-[60] overflow-hidden"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleMarkPreferred(); }}
                                        disabled={isPreferred || isNotPreferred || sending}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-all">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">MARK PREFERRED</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleMarkNotPreferred(); }}
                                        disabled={isPreferred || isNotPreferred || sending}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/30 transition-all">
                                            <X size={16} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">NOT PREFERRED</span>
                                    </button>
                                    <div className="h-px bg-white/10 mx-5 my-1" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowCardMenu(false); handleSaveProfile(); }}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/30 transition-all">
                                            <Bookmark size={16} fill={savedCandidateIds.has(user.id) ? "currentColor" : "none"} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">SAVE FOR LATER</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center flex-1 pt-6 md:pt-10 px-5 md:px-8 pb-6 md:pb-10">

                        {/* High-Impact Avatar with Multi-layer Glow */}
                        <div className="relative mb-6 shrink-0">
                            {/* Intense nebula pulse */}
                            <div className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/30 to-fuchsia-500/20 blur-[25px] animate-pulse" />
                            <div className="absolute inset-[-8px] rounded-full bg-indigo-500/20 blur-[12px]" />
                            
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-[1.5px] md:p-[2px] bg-gradient-to-b from-white/40 via-white/10 to-transparent shadow-[0_0_40px_rgba(99,102,241,0.2)] relative z-10 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]">
                                <div className="w-full h-full rounded-full bg-[#0f0e1a] p-[3px]">
                                    <div className="w-full h-full rounded-full overflow-hidden grayscale-[0.1] brightness-110 transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-125">
                                        <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover scale-105" draggable="false" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-[4px] border-[#050505] rounded-full z-20 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                        </div>

                        {/* Name - High Contrast Gradient */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                {user.selectionMode === "explore" && (
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                                        EXCLUSIVE DISCOVERY
                                    </span>
                                )}
                            </div>
                            <h2 className="text-[24px] md:text-[32px] font-bold text-white tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-2xl capitalize">
                                {user.firstname} {user.lastname}
                            </h2>
                            <div className="flex items-center justify-center gap-3 mt-4">
                                <span className="text-[11px] font-bold tracking-[0.1em] text-indigo-300 uppercase bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                    {user.expertise?.skills?.[0] || user.profileQualityLabel || "Community Member"}
                                </span>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-white/5 bg-white/[0.03]">
                                    <ShieldCheck size={12} className="text-cyan-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight text-white/50">Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Highlighting Match Context */}
                        <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-4 px-4 overflow-hidden mb-8">
                            {user.matchReason && (
                                <div className="relative py-1 px-5 w-full">
                                    {/* Accent line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]" />

                                    <div className="space-y-2">
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/90 text-left">Matching Context</p>
                                        <p className="text-[13px] md:text-[14px] text-white/95 leading-relaxed font-medium text-left line-clamp-3">
                                            {user.matchReason}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!user.matchReason && (
                                <div className="relative px-5 border-l border-white/10 w-full">
                                    <p className="text-[14px] text-white/60 leading-relaxed font-light italic text-left line-clamp-4">
                                        &ldquo;{user.expertise?.aboutYou || "Looking for meaningful connections and opportunities to grow together."}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Enhanced High-Glow Actions */}
                        <div className="w-full flex items-center justify-center gap-6 md:gap-8 shrink-0 mt-auto pb-2 md:pb-4" onPointerDown={(e) => e.stopPropagation()}>
                            <motion.button
                                style={{ scale: nopeScale }}
                                onClick={handleIgnore}
                                disabled={sending}
                                whileHover={{ y: -3, scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/20 text-white/20 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300 shadow-2xl group"
                            >
                                <X size={20} className="md:w-6 md:h-6 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            </motion.button>

                            <button
                                onClick={() => setShowExpertise(true)}
                                className="px-6 md:px-8 py-3.5 md:py-4 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 relative group overflow-hidden bg-white/10 border border-white/20 hover:border-white/40 shadow-2xl hover:shadow-indigo-500/20"
                            >
                                <span className="relative z-10">VIEW PROFILE</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>

                            <motion.button
                                style={{ scale: likeScale }}
                                onClick={handleInterested}
                                disabled={sending}
                                whileHover={{ y: -3, scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.5)] transition-all duration-300"
                            >
                                <Check size={20} className="md:w-6 md:h-6" strokeWidth={4} />
                            </motion.button>
                        </div>

                        {isFetchingMore && (
                            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 animate-pulse">
                                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
                                    SYNCHRONIZING
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConnectionCard;

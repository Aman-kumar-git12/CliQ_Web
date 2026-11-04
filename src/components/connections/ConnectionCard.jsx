import { motion, AnimatePresence, useReducedMotion, useTransform } from "framer-motion";
import { X, Check, ShieldCheck, Bookmark, MoreVertical } from "lucide-react";
import { DURATION, EASE_SOFT, popoverMotion } from "../common/motionPresets";

const ConnectionCard = ({
    user,
    isPreferred,
    isNotPreferred,
    dragX,
    rotate,
    rotateX,
    rotateY,
    transformOrigin,
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
    setShowExpertise,
    handleIgnore,
    handleInterested,
    isFetchingMore,
    handleMouseMove,
    handleMouseLeave,
    handleDragEnd,
    avatar,
}) => {
    // Fade the card as it flies off-screen so the swipe-out ends softly instead of vanishing at full opacity
    const reduceMotion = useReducedMotion();
    const exitOpacity = useTransform(dragX, [-800, -320, 0, 320, 800], [0, 1, 1, 1, 0]);

    return (
        <motion.div
            className="relative w-full max-w-full sm:max-w-md md:max-w-md z-20 group mx-auto md:mx-0"
            style={{ opacity: exitOpacity }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                key={user.id}
                drag="x"
                onDragEnd={handleDragEnd}
                dragElastic={0.8}
                dragMomentum={false}
                whileTap={{ scale: 0.98 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                initial={{ scale: 0.95, opacity: 0, y: 24 }}
                transition={{ duration: DURATION.page, ease: EASE_SOFT }}
                style={{ x: dragX, rotate, rotateX, rotateY, transformOrigin, touchAction: "none" }}
                className="w-full relative rounded-[28px] md:rounded-[40px] flex flex-col cursor-grab active:cursor-grabbing min-h-[480px] md:min-h-[600px] p-[1px] md:p-[1.5px] bg-gradient-to-b from-white/10 via-white/5 to-white/5 shadow-pop will-change-transform group/card"
            >
                {/* Visual Highlight Border */}
                <div className="absolute inset-0 rounded-[28px] md:rounded-[40px] p-[1px] bg-gradient-to-tr from-brand-light via-brand to-brand-pink opacity-20 group-hover/card:opacity-50 transition-opacity duration-250 ease-soft z-0" />

                <div className="relative w-full flex-1 bg-surface-750 rounded-[27px] md:rounded-[39px] overflow-hidden flex flex-col z-10 border border-line">
                    {/* Shimmering Surface Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full motion-safe:group-hover/card:animate-[shimmer_3s_infinite] pointer-events-none" />

                    {/* Highly refined accent glow at top */}
                    <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[140%] h-[40%] bg-brand/15 rounded-[100%] blur-[90px] pointer-events-none z-0" />

                    {/* Swipe Stamps - Enhanced High-Visibility */}
                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-10 left-10 z-50 -rotate-12 px-6 py-2 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white font-black text-[10px] tracking-[0.2em] uppercase pointer-events-none scale-110"
                    >
                        INTERESTED
                    </motion.div>
                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-10 right-10 z-50 rotate-12 px-6 py-2 rounded-2xl bg-surface-600/95 text-white font-black text-[10px] tracking-[0.2em] uppercase pointer-events-none border border-white/20 shadow-soft"
                    >
                        IGNORE
                    </motion.div>

                    {/* Options Menu Button - Glassy Highlight */}
                    <div className="absolute top-6 right-6 z-50">
                        <button
                            type="button"
                            aria-label="More options"
                            aria-expanded={showCardMenu}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCardMenu(!showCardMenu);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-line-strong text-white/50 hover:text-white active:scale-95 cliq-transition shadow-soft focus-ring"
                        >
                            <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                            {showCardMenu && (
                                <motion.div
                                    {...popoverMotion(reduceMotion)}
                                    className="cliq-popover absolute top-12 right-0 w-56 origin-top-right rounded-[22px] py-2 z-[60] overflow-hidden"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCardMenu(false);
                                            handleMarkPreferred();
                                        }}
                                        disabled={isPreferred || isNotPreferred || sending}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors duration-150 ease-soft group focus-visible:outline-none focus-visible:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors duration-150">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">
                                            MARK PREFERRED
                                        </span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCardMenu(false);
                                            handleMarkNotPreferred();
                                        }}
                                        disabled={isPreferred || isNotPreferred || sending}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors duration-150 ease-soft group focus-visible:outline-none focus-visible:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/30 transition-colors duration-150">
                                            <X size={16} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">
                                            NOT PREFERRED
                                        </span>
                                    </button>
                                    <div className="h-px bg-white/10 mx-5 my-1" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCardMenu(false);
                                            handleSaveProfile();
                                        }}
                                        className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-white/[0.05] transition-colors duration-150 ease-soft group focus-visible:outline-none focus-visible:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/30 transition-colors duration-150">
                                            <Bookmark
                                                size={16}
                                                fill={savedCandidateIds.has(user.id) ? "currentColor" : "none"}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-white/80">
                                            SAVE FOR LATER
                                        </span>
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
                            <div className="absolute inset-[-20px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-brand/25 to-brand-pink/20 blur-[25px] motion-safe:animate-pulse" />
                            <div className="absolute inset-[-8px] rounded-full bg-brand/20 blur-[12px]" />

                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-[1.5px] md:p-[2px] bg-gradient-to-b from-white/40 via-white/10 to-transparent shadow-xl shadow-brand/20 relative z-10 transition duration-250 ease-soft group-hover:scale-105 group-hover:shadow-brand/40">
                                <div className="w-full h-full rounded-full bg-surface-750 p-[3px]">
                                    <div className="w-full h-full rounded-full overflow-hidden grayscale-[0.1] brightness-110 transition duration-250 ease-soft group-hover:grayscale-0 group-hover:brightness-125">
                                        <img
                                            src={avatar(user.imageUrl)}
                                            alt={[user.firstname, user.lastname].filter(Boolean).join(" ") || "User"}
                                            className="w-full h-full object-cover scale-105"
                                            draggable="false"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-[4px] border-surface-750 rounded-full z-20 shadow-md shadow-emerald-500/50" />
                        </div>

                        {/* Name - High Contrast Gradient */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                {user.selectionMode === "explore" && (
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-300/90">
                                        EXCLUSIVE DISCOVERY
                                    </span>
                                )}
                            </div>
                            <h2 className="text-[24px] md:text-[32px] font-bold text-white tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-soft-lg capitalize">
                                {user.firstname} {user.lastname}
                            </h2>
                            <div className="flex items-center justify-center gap-3 mt-4">
                                <span className="text-[11px] font-bold tracking-[0.1em] text-brand-light uppercase bg-brand/10 px-3 py-1 rounded-lg border border-brand/20">
                                    {user.expertise?.skills?.[0] || user.profileQualityLabel || "Community Member"}
                                </span>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-white/5 bg-white/[0.03]">
                                    <ShieldCheck size={12} className="text-cyan-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight text-white/50">
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Highlighting Match Context */}
                        <div className="flex-1 w-full flex flex-col items-center justify-center text-center gap-4 px-4 overflow-hidden mb-8">
                            {user.matchReason && (
                                <div className="relative py-1 px-5 w-full">
                                    {/* Accent line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 to-brand rounded-full" />

                                    <div className="space-y-2">
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/90 text-left">
                                            Matching Context
                                        </p>
                                        <p className="text-[13px] md:text-[14px] text-white/95 leading-relaxed font-medium text-left line-clamp-3">
                                            {user.matchReason}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!user.matchReason && (
                                <div className="relative px-5 border-l border-line w-full">
                                    <p className="text-[14px] text-white/60 leading-relaxed font-light italic text-left line-clamp-4">
                                        &ldquo;
                                        {user.expertise?.aboutYou ||
                                            "Looking for meaningful connections and opportunities to grow together."}
                                        &rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Enhanced High-Glow Actions */}
                        <div
                            className="w-full flex items-center justify-center gap-6 md:gap-8 shrink-0 mt-auto pb-2 md:pb-4"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {/* The drag-driven scale lives on the wrapper so hover/tap motion never fights it */}
                            <motion.div style={{ scale: nopeScale }}>
                                <motion.button
                                    type="button"
                                    aria-label="Not interested"
                                    onClick={handleIgnore}
                                    disabled={sending}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/20 text-ink-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors duration-150 ease-soft shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                                >
                                    <X size={20} className="md:w-6 md:h-6" />
                                </motion.button>
                            </motion.div>

                            <button
                                onClick={() => setShowExpertise(true)}
                                className="px-6 md:px-8 py-3.5 md:py-4 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white cliq-press relative group overflow-hidden bg-white/10 hover:bg-white/[0.14] border border-white/20 hover:border-white/30 shadow-soft-lg hover:shadow-brand/20 focus-ring"
                            >
                                <span className="relative z-10">VIEW PROFILE</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-soft motion-reduce:hidden" />
                            </button>

                            <motion.div style={{ scale: likeScale }}>
                                <motion.button
                                    type="button"
                                    aria-label="Interested, send connection request"
                                    onClick={handleInterested}
                                    disabled={sending}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/20 hover:shadow-white/30 transition-shadow duration-150 ease-soft disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                                >
                                    <Check size={20} className="md:w-6 md:h-6" strokeWidth={4} />
                                </motion.button>
                            </motion.div>
                        </div>

                        {isFetchingMore && (
                            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 motion-safe:animate-pulse">
                                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-cyan-300/90">
                                    SYNCHRONIZING
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConnectionCard;

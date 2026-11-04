import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import ConnectionCard from "./ConnectionCard";
import { ConnectionNudge } from "./ConnectionSharedUI";
import MatchCardShimmering from "../shimmering/MatchCardShimmering";
import { avatarUrl } from "../../utils/avatar";
import { getConfidenceBadgeClass, getViewerProfileNudge } from "../../utils/connectionPageHelpers";

/**
 * The swipeable match card (or its loading / empty state) with the profile nudge and the action snack.
 * @param {{ logic: ReturnType<typeof import("../../hooks/useConnectionLogic").useConnectionLogic> }} props
 */
export default function ConnectionMatchStage({ logic }) {
    const {
        user,
        loading,
        sending,
        isFetchingMore,
        activePanel,
        savingProfile,
        snack,
        showCardMenu,
        viewerProfile,
        dragX,
        springRotateX,
        springRotateY,
        rotate,
        transformOrigin,
        likeScale,
        nopeScale,
        likeOpacity,
        nopeOpacity,
        controls,
        setShowExpertise,
        setShowCardMenu,
        handleIgnore,
        handleInterested,
        handleMarkPreferred,
        handleMarkNotPreferred,
        handleSaveProfile,
        handleDragEnd,
        handleMouseMove,
        handleMouseLeave,
        refreshMatches,
        isPreferred,
        isNotPreferred,
        savedCandidateIds,
    } = logic;

    return (
        <div className="relative z-10 w-full flex flex-col items-center md:pl-0">
            {!activePanel && <ConnectionNudge nudge={getViewerProfileNudge(viewerProfile?.expertise || {})} />}

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="shimmer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full flex justify-center py-4 md:py-8"
                    >
                        <MatchCardShimmering />
                    </motion.div>
                ) : !user ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center py-20 text-ink-300 text-center"
                    >
                        <span className="mb-5 w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand-light shadow-lg shadow-brand/20">
                            <Sparkles size={28} />
                        </span>
                        <p className="text-lg md:text-xl font-black uppercase tracking-widest italic text-white/80">
                            No more smart matches right now.
                        </p>
                        <p className="mt-2 text-sm text-ink-400">Check back soon, or refresh to look again.</p>
                        <button
                            onClick={refreshMatches}
                            className="mt-6 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/90 cliq-press shadow-soft-lg focus-ring"
                        >
                            Refresh Matches
                        </button>
                    </motion.div>
                ) : (
                    <div
                        key="deck"
                        className="relative flex flex-col items-center w-full max-w-full sm:max-w-md md:max-w-md mx-auto md:mx-0 [perspective:1200px]"
                    >
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
                            avatar={avatarUrl}
                            handleDragEnd={handleDragEnd}
                        />
                        <AnimatePresence>
                            {snack && !activePanel && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                                    exit={{ opacity: 0, y: 15, x: "-50%" }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    role="status"
                                    className="absolute left-1/2 bottom-[-40px] z-[100] px-8 py-4 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-pop pointer-events-none whitespace-nowrap"
                                >
                                    {snack}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

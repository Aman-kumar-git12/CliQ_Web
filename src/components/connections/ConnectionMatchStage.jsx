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
                        className="w-full flex justify-center py-4 md:py-8"
                    >
                        <MatchCardShimmering />
                    </motion.div>
                ) : !user ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-neutral-500 text-center"
                    >
                        <Sparkles size={48} className="mb-4 text-neutral-700" />
                        <p className="text-xl font-black uppercase tracking-widest italic">
                            No more smart matches right now.
                        </p>
                        <button
                            onClick={refreshMatches}
                            className="mt-6 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all shadow-xl"
                        >
                            Refresh Matches
                        </button>
                    </motion.div>
                ) : (
                    <div className="relative flex flex-col items-center w-full max-w-full sm:max-w-md md:max-w-md mx-auto md:mx-0">
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
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    className="absolute left-1/2 bottom-[-40px] z-[100] px-10 py-5 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20 whitespace-nowrap"
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

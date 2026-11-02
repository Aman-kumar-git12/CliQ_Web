import PostCardShimmering from "./PostCardShimmering";

// Mirrors HomePage: post composer, feed tabs and post cards in the feed column, plus the right sidebar on wide screens
const HomeShimmering = () => {
    return (
        <div
            role="status"
            aria-label="Loading feed"
            aria-busy="true"
            className="relative flex justify-center gap-10 w-full pt-[85px] md:pt-4 pb-24 md:pb-8 min-h-screen px-4 xl:px-0 bg-transparent motion-safe:animate-pulse"
        >
            {/* FEED COLUMN SKELETON */}
            <div className="relative flex-grow max-w-[640px] w-full flex flex-col items-center md:items-stretch">
                {/* Post composer */}
                <div className="cliq-feed-panel rounded-[1.5rem] p-4 mb-6 max-w-[560px] w-full self-center mx-auto">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-brand-light/15 shrink-0"></div>
                        <div className="flex-1 flex flex-col gap-2.5">
                            <div className="w-full min-h-[60px] rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                                <div className="h-3 w-1/2 bg-brand-light/10 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t cliq-feed-divider">
                                <div className="h-7 w-20 rounded-full bg-white/[0.04] border border-white/5"></div>
                                <div className="h-7 w-24 rounded-full bg-brand-light/15"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed tabs */}
                <div className="flex items-center gap-6 sm:gap-10 mb-6 border-b cliq-feed-divider px-4 max-w-[560px] w-full self-center">
                    {["w-14", "w-[72px]", "w-16"].map((width) => (
                        <div key={width} className="pb-3">
                            <div className={`h-3 ${width} bg-brand-light/10 rounded-full`}></div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pb-20 w-full">
                    {[1, 2, 3].map((item) => (
                        <PostCardShimmering key={item} nested />
                    ))}
                </div>
            </div>

            {/* RIGHT SIDEBAR COLUMN SKELETON (Aligned with Purple Theme) */}
            <div className="relative hidden xl:block w-[320px] shrink-0 pt-2 px-1">
                {/* User Card Skeleton */}
                <div className="flex items-center justify-between p-4 bg-surface-850 border border-white/5 rounded-2xl mb-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                        {/* Avatar (12x12) */}
                        <div className="w-12 h-12 rounded-full bg-brand-light/15"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-3.5 w-24 bg-brand-light/20 rounded-full"></div>
                            <div className="h-2.5 w-16 bg-brand-light/10 rounded-full"></div>
                        </div>
                    </div>
                    <div className="w-9 h-9 bg-white/5 rounded-lg"></div>
                </div>

                {/* Sidebar Header Skeleton */}
                <div className="flex items-center justify-between mb-5 px-1 text-white/20 uppercase tracking-widest font-black text-[10px]">
                    <div className="h-2.5 w-32 bg-brand-light/10 rounded-full"></div>
                    <div className="w-4 h-4 rounded-full bg-white/5"></div>
                </div>

                {/* Suggested Suggestions List */}
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl"
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-light/15"></div>
                            <div className="flex flex-col flex-1 min-w-0 gap-2">
                                <div className="h-3.5 w-28 bg-brand-light/20 rounded-full"></div>
                                <div className="h-2.5 w-20 bg-brand-light/10 rounded-full"></div>
                            </div>
                            <div className="w-9 h-9 bg-white/5 rounded-xl"></div>
                        </div>
                    ))}
                </div>

                {/* Footer Skeleton */}
                <div className="mt-10 flex flex-wrap justify-center gap-5 px-4">
                    {[1, 2, 3, 4].map((idx) => (
                        <div key={idx} className="h-2.5 w-10 bg-white/5 rounded-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeShimmering;

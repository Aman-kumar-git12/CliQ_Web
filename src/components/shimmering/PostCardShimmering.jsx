// One feed post card skeleton (same frame as PostCard). Used by the Home feed, Saved posts and
// the "loading more" row at the bottom of post lists.
// `nested`: part of a bigger skeleton that already announces the loading state and pulses
const PostCardShimmering = ({ label = "Loading post", nested = false }) => {
    const status = nested ? {} : { role: "status", "aria-label": label, "aria-busy": true };
    return (
        <div
            {...status}
            className={`cliq-feed-panel rounded-2xl p-3.5 mb-3 relative flex flex-col max-w-[560px] w-full mx-auto ${nested ? "" : "motion-safe:animate-pulse"}`}
        >
            {/* Header Section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    {/* Avatar Skeleton (9x9) */}
                    <div className="w-9 h-9 rounded-full bg-brand-light/15 border-2 border-black/20 flex-shrink-0"></div>

                    <div className="flex flex-col gap-1.5">
                        <div className="h-3.5 w-28 bg-brand-light/20 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-14 bg-brand-light/10 rounded-full"></div>
                            <div className="w-1 h-1 rounded-full bg-brand-light/10"></div>
                            <div className="h-2 w-10 bg-blue-500/10 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-light/5"></div>
            </div>

            {/* Content Area Skeleton */}
            <div className="px-0.5 mt-1">
                {/* Text lines */}
                <div className="space-y-2.5 mb-4">
                    <div className="h-3 w-full bg-brand-light/15 rounded-full"></div>
                    <div className="h-3 w-[92%] bg-brand-light/15 rounded-full"></div>
                    <div className="h-3 w-[65%] bg-brand-light/15 rounded-full"></div>
                </div>

                {/* Media Area Skeleton (Realistic Match) */}
                <div className="w-full h-[240px] bg-black/40 rounded-lg mb-4 border border-line-soft relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    {/* Caption placeholder */}
                    <div className="absolute bottom-4 left-4 h-3 w-32 bg-white/10 rounded-full"></div>
                </div>

                {/* Hashtags placeholders */}
                <div className="flex gap-2 mb-4">
                    <div className="h-4 w-16 bg-brand/10 border border-brand-light/10 rounded-full"></div>
                    <div className="h-4 w-14 bg-brand/10 border border-brand-light/10 rounded-full"></div>
                    <div className="h-4 w-18 bg-brand/10 border border-brand-light/10 rounded-full"></div>
                </div>
            </div>

            {/* Actions Section Skeleton */}
            <div className="flex items-center justify-between pt-3 border-t cliq-feed-divider px-0.5">
                <div className="flex items-center gap-5">
                    {/* Like / Comment / Repeat */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-brand-light/10"></div>
                            <div className="h-2.5 w-6 bg-brand-light/10 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* Share button */}
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-brand-light/10 rounded-sm"></div>
                    <div className="h-2.5 w-12 bg-brand-light/10 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default PostCardShimmering;

// 3-column grid of post tiles, as on the profile Posts tab.
// `nested`: part of a bigger skeleton that already announces the loading state
const PostTileGridShimmering = ({ count = 9, nested = false }) => {
    const status = nested ? {} : { role: "status", "aria-label": "Loading posts", "aria-busy": true };
    return (
        <div
            {...status}
            className={`grid grid-cols-3 gap-1 md:gap-4 transition-all duration-500 ${nested ? "" : "motion-safe:animate-pulse"}`}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="aspect-square bg-white/[0.02] border border-white/10 rounded-[16px] md:rounded-[28px] overflow-hidden relative shadow-lg"
                >
                    <div className="w-full h-full bg-white/5"></div>
                </div>
            ))}
        </div>
    );
};

export default PostTileGridShimmering;

import MatchCardShimmering from "./MatchCardShimmering";

// Get Connections (Explore): the "Intelligence Matcher" title block and the match card.
// `withFrame` adds ExplorePage's own frame, for when the Explore page itself is still loading.
const GetConnectionsShimmering = ({ withFrame = false }) => {
    const content = (
        <div className="w-full relative min-h-screen flex flex-col items-center pt-1 md:pt-2 pb-24 md:pb-12 px-4 md:pl-0 md:pr-6 overflow-visible">
            {/* Header (ConnectionsHeader) */}
            <div className="w-full max-w-full md:max-w-2xl flex flex-col items-start justify-start mb-4 md:mb-3 px-4 md:px-0 motion-safe:animate-pulse">
                <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 bg-brand/20 rounded-full"></div>
                        <div className="h-2 w-28 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="md:hidden h-6 w-7 rounded-lg bg-white/5 border border-white/10"></div>
                </div>
                <div className="flex flex-row items-end justify-between w-full">
                    <div className="flex flex-col gap-1.5">
                        <div className="h-[26px] md:h-8 w-44 md:w-56 bg-white/10 rounded-lg"></div>
                        <div className="h-5 md:h-6 w-28 md:w-36 bg-white/5 rounded-lg"></div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-8 w-[104px] rounded-xl border border-white/10 bg-white/[0.03]"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Match stage */}
            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-full flex justify-center py-4 md:py-8">
                    <MatchCardShimmering nested />
                </div>
            </div>
        </div>
    );

    const status = { role: "status", "aria-label": "Loading connections", "aria-busy": true };

    if (!withFrame) return <div {...status}>{content}</div>;

    return (
        <div
            {...status}
            className="w-full relative min-h-screen md:h-[100dvh] pt-[85px] md:pt-2 pb-24 md:pb-0 bg-transparent overflow-visible md:overflow-hidden flex flex-col px-4 md:px-0"
        >
            <div className="relative z-10 px-0 max-w-full flex-1 min-h-0 overflow-visible md:overflow-hidden">
                {content}
            </div>
        </div>
    );
};

export default GetConnectionsShimmering;

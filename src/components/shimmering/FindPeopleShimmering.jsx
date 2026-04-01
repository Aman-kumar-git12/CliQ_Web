export default function FindPeopleShimmering({ count = 8, viewMode = "list" }) {
    return (
        <div className="w-full animate-pulse space-y-6 max-w-full md:max-w-2xl mx-auto">
            <div className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                : "flex flex-col gap-3 md:gap-4"
            }>
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={viewMode === "grid"
                            ? "flex flex-col items-center p-3 md:p-4 rounded-[20px] md:rounded-[22px] border border-white/5 bg-purple-900/5 shadow-xl"
                            : "flex items-center gap-3.5 md:gap-5 p-3 md:p-[18px] rounded-[20px] md:rounded-[22px] border border-white/5 bg-purple-900/5 shadow-xl"
                        }
                    >
                        {viewMode === "grid" ? (
                            <>
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-500/10 mb-4 border border-white/5"></div>
                                <div className="space-y-2 w-full flex flex-col items-center">
                                    <div className="h-3 w-20 bg-purple-500/20 rounded-full"></div>
                                    <div className="h-2 w-14 bg-purple-500/10 rounded-full opacity-50"></div>
                                </div>
                                <div className="mt-4 w-full h-8 bg-purple-500/20 rounded-lg"></div>
                            </>
                        ) : (
                            <>
                                <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-[14px] md:rounded-[18px] bg-purple-500/10 shrink-0 border border-white/5"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 md:h-5 w-24 md:w-48 bg-purple-500/20 rounded-lg"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-16 bg-purple-500/10 rounded-full opacity-50"></div>
                                        <div className="h-2 w-20 bg-purple-500/10 rounded-full opacity-30"></div>
                                    </div>
                                </div>
                                <div className="w-16 md:w-28 h-8 md:h-11 bg-purple-500/20 rounded-[10px] md:rounded-[12px] shrink-0"></div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

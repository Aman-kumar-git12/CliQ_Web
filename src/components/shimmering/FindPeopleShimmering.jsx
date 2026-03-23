export default function FindPeopleShimmering({ count = 8, viewMode = "list" }) {
    return (
        <div className="w-full animate-pulse space-y-8">
            {/* Header Shimmer */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-neutral-800 rounded-full"></div>
                    <div className="h-8 w-48 bg-neutral-800 rounded-lg"></div>
                </div>
                <div className="h-12 w-full md:w-32 bg-neutral-800 rounded-[16px]"></div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-3 w-32 bg-neutral-800 rounded-full opacity-40"></div>
                    <div className="h-px flex-1 bg-neutral-800 opacity-20"></div>
                </div>

                <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    : "flex flex-col gap-6 max-w-4xl"
                }>
                    {Array.from({ length: count }).map((_, index) => (
                        <div
                            key={index}
                            className={viewMode === "grid"
                                ? "flex flex-col items-center p-6 rounded-[26px] border border-white/5 bg-neutral-900/40"
                                : "flex items-center gap-8 p-6 rounded-[26px] border border-white/5 bg-neutral-900/40"
                            }
                        >
                            {viewMode === "grid" ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-neutral-800 mb-4"></div>
                                    <div className="space-y-2 w-full flex flex-col items-center">
                                        <div className="h-3 w-24 bg-neutral-800 rounded-full"></div>
                                        <div className="h-2 w-16 bg-neutral-800 rounded-full opacity-50"></div>
                                    </div>
                                    <div className="mt-5 w-full h-10 bg-neutral-800 rounded-xl"></div>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-2xl bg-neutral-800 shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 w-40 bg-neutral-800 rounded-lg"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-2 w-20 bg-neutral-800 rounded-full opacity-50"></div>
                                            <div className="h-2 w-32 bg-neutral-800 rounded-full opacity-30"></div>
                                        </div>
                                    </div>
                                    <div className="w-32 h-11 bg-neutral-800 rounded-xl shrink-0"></div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

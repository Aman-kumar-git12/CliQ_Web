const LABELS = { dashboard: "Loading dashboard", history: "Loading history", saved: "Loading saved profiles" };

const InsightCardShimmer = () => (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-md bg-white/5"></div>
            <div className="h-2.5 w-16 bg-white/5 rounded-full"></div>
        </div>
        <div className="h-7 w-12 bg-white/10 rounded-lg"></div>
    </div>
);

// Body of the Get Connections Dashboard / History / Saved dialog while its data loads:
// insight tiles and breakdown cards for the dashboard, tiles plus recent activity for history, profile rows for saved
const ConnectionPanelShimmering = ({ panel }) => {
    return (
        <div
            role="status"
            aria-label={LABELS[panel] || "Loading"}
            aria-busy="true"
            className="motion-safe:animate-pulse"
        >
            {panel === "dashboard" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <InsightCardShimmer key={i} />
                        ))}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                                <div className="h-2.5 w-28 bg-white/10 rounded-full mb-5"></div>
                                <div className="space-y-3">
                                    <div className="h-2.5 w-full bg-white/5 rounded-full"></div>
                                    <div className="h-2.5 w-4/5 bg-white/5 rounded-full"></div>
                                    <div className="h-2.5 w-3/5 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                        <div className="h-2.5 w-32 bg-white/10 rounded-full mb-5"></div>
                        <div className="h-36 w-full bg-white/[0.04] rounded-2xl"></div>
                    </div>
                </div>
            )}

            {panel === "history" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <InsightCardShimmer key={i} />
                        ))}
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                        <div className="h-3 w-36 bg-white/10 rounded-full mb-5"></div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/10 shrink-0"></div>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="h-3.5 w-32 bg-white/10 rounded-full"></div>
                                        <div className="h-2.5 w-48 max-w-full bg-white/5 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {panel !== "dashboard" && panel !== "history" && (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center gap-4 md:justify-between"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-16 h-16 rounded-full bg-white/10 shrink-0"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-36 bg-white/10 rounded-full"></div>
                                    <div className="h-3 w-52 max-w-full bg-white/5 rounded-full"></div>
                                    <div className="h-2.5 w-28 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-9 w-16 rounded-xl border border-white/10 bg-white/5"></div>
                                <div className="h-9 w-24 rounded-xl bg-white/10"></div>
                                <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/5"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConnectionPanelShimmering;

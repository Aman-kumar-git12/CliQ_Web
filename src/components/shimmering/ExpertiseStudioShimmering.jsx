// Expertise Studio (light theme): sticky header, intro card, the three form sections and the template gallery
const FieldShimmer = ({ textarea = false }) => (
    <div className="space-y-2">
        <div className="ml-1 h-2.5 w-24 rounded-full bg-slate-200"></div>
        <div
            className={`w-full border border-slate-200 bg-slate-50 ${textarea ? "min-h-[112px] rounded-[20px]" : "h-12 rounded-[18px]"}`}
        ></div>
    </div>
);

const SectionShimmer = ({ children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <div className="h-[44px] w-[44px] rounded-2xl border border-slate-200 bg-white shadow-sm"></div>
            <div className="h-5 w-48 rounded-lg bg-slate-200"></div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            {children}
        </div>
    </div>
);

const ExpertiseStudioShimmering = () => {
    return (
        <div
            role="status"
            aria-label="Loading expertise studio"
            aria-busy="true"
            className="min-h-screen bg-white text-slate-900 relative overflow-hidden"
        >
            <div className="absolute top-[-10%] left-[-10%] h-[420px] w-[420px] rounded-full bg-slate-200/60 blur-[120px] pointer-events-none" />
            <div className="absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-indigo-100/70 blur-[120px] pointer-events-none" />

            <div className="motion-safe:animate-pulse">
                {/* Header (ExpertiseStudioHeader) */}
                <div className="sticky top-0 z-[100] w-full border-b border-black/5 bg-white/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-[44px] w-[44px] rounded-full border border-slate-200 bg-white"></div>
                            <div className="space-y-2">
                                <div className="h-2.5 w-24 rounded-full bg-slate-200"></div>
                                <div className="h-6 w-40 rounded-lg bg-slate-200"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-[46px] w-[46px] sm:w-36 rounded-full border border-slate-200 bg-white"></div>
                            <div className="h-[46px] w-36 sm:w-40 rounded-full bg-slate-300"></div>
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
                        {/* LEFT COLUMN - form */}
                        <div className="space-y-8 xl:col-span-7">
                            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="space-y-3">
                                        <div className="h-6 w-28 rounded-full bg-indigo-50 border border-indigo-100"></div>
                                        <div className="h-8 w-72 max-w-full rounded-lg bg-slate-200"></div>
                                        <div className="h-3 w-80 max-w-full rounded-full bg-slate-100"></div>
                                        <div className="h-3 w-64 max-w-full rounded-full bg-slate-100"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="h-[62px] w-full sm:w-[72px] rounded-2xl border border-slate-200 bg-slate-50"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <SectionShimmer>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <FieldShimmer key={i} />
                                    ))}
                                </div>
                            </SectionShimmer>

                            <SectionShimmer>
                                <div className="space-y-4">
                                    <FieldShimmer textarea />
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FieldShimmer />
                                        <FieldShimmer />
                                    </div>
                                </div>
                            </SectionShimmer>

                            <SectionShimmer>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FieldShimmer textarea />
                                    <FieldShimmer textarea />
                                    <div className="md:col-span-2">
                                        <FieldShimmer />
                                    </div>
                                </div>
                            </SectionShimmer>
                        </div>

                        {/* RIGHT COLUMN - template gallery */}
                        <div className="space-y-6 xl:col-span-5">
                            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                                <div className="flex items-center justify-between">
                                    <div className="h-2.5 w-28 rounded-full bg-slate-200"></div>
                                    <div className="h-2.5 w-20 rounded-full bg-slate-200"></div>
                                </div>
                                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="mb-4 flex items-start gap-3">
                                        <div className="h-9 w-9 rounded-2xl bg-slate-300"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 rounded-full bg-slate-200"></div>
                                            <div className="h-3 w-full rounded-full bg-slate-100"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className="overflow-hidden rounded-[22px] border border-slate-200 bg-white"
                                            >
                                                <div className="aspect-[4/3] border-b border-slate-200 bg-slate-100"></div>
                                                <div className="space-y-2 px-3 py-3">
                                                    <div className="h-2 w-16 rounded-full bg-slate-200"></div>
                                                    <div className="h-3 w-20 rounded-full bg-slate-200"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertiseStudioShimmering;

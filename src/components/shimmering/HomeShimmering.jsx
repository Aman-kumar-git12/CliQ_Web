import React from "react";

const HomeShimmering = () => {
    return (
        <div className="flex justify-center gap-12 w-full pt-8 px-4 bg-transparent animate-pulse">
            {/* FEED COLUMN SKELETON */}
            <div className="flex-grow max-w-[560px] w-full">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="cliq-feed-panel rounded-2xl p-3.5 mb-3 relative flex flex-col w-full mx-auto"
                    >
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                                {/* Avatar Skeleton (9x9) */}
                                <div className="w-9 h-9 rounded-full bg-[#a78bfa]/15 border-2 border-black/20 flex-shrink-0"></div>
                                
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-3.5 w-28 bg-[#a78bfa]/20 rounded-full"></div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-14 bg-[#a78bfa]/10 rounded-full"></div>
                                        <div className="w-1 h-1 rounded-full bg-[#a78bfa]/10"></div>
                                        <div className="h-2 w-10 bg-blue-500/10 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#a78bfa]/5"></div>
                        </div>

                        {/* Content Area Skeleton */}
                        <div className="px-0.5 mt-1">
                            {/* Text lines */}
                            <div className="space-y-2.5 mb-4">
                                <div className="h-3 w-full bg-[#a78bfa]/15 rounded-full"></div>
                                <div className="h-3 w-[92%] bg-[#a78bfa]/15 rounded-full"></div>
                                <div className="h-3 w-[65%] bg-[#a78bfa]/15 rounded-full"></div>
                            </div>

                            {/* Media Area Skeleton (Realistic Match) */}
                            <div className="w-full h-[320px] bg-black/40 rounded-lg mb-4 border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                {/* Caption placeholder */}
                                <div className="absolute bottom-4 left-4 h-3 w-32 bg-white/10 rounded-full"></div>
                            </div>

                            {/* Hashtags placeholders */}
                            <div className="flex gap-2 mb-4">
                                <div className="h-4 w-16 bg-violet-500/10 border border-violet-300/10 rounded-full"></div>
                                <div className="h-4 w-14 bg-violet-500/10 border border-violet-300/10 rounded-full"></div>
                                <div className="h-4 w-18 bg-violet-500/10 border border-violet-300/10 rounded-full"></div>
                            </div>
                        </div>

                        {/* Actions Section Skeleton */}
                        <div className="flex items-center justify-between pt-3 border-t cliq-feed-divider px-0.5">
                            <div className="flex items-center gap-5">
                                {/* Like / Comment / Repeat */}
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md bg-[#a78bfa]/10"></div>
                                    <div className="h-2.5 w-6 bg-[#a78bfa]/10 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md bg-[#a78bfa]/10"></div>
                                    <div className="h-2.5 w-6 bg-[#a78bfa]/10 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md bg-[#a78bfa]/10"></div>
                                    <div className="h-2.5 w-6 bg-[#a78bfa]/10 rounded-full"></div>
                                </div>
                            </div>

                            {/* Share button */}
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 bg-[#a78bfa]/10 rounded-sm"></div>
                                <div className="h-2.5 w-12 bg-[#a78bfa]/10 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT SIDEBAR COLUMN SKELETON (Aligned with Purple Theme) */}
            <div className="hidden lg:block w-[320px] shrink-0 sticky top-8 h-fit">
                {/* User Card Skeleton */}
                <div className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-white/5 rounded-2xl mb-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                        {/* Avatar (12x12) */}
                        <div className="w-12 h-12 rounded-full bg-[#a78bfa]/15"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-3.5 w-24 bg-[#a78bfa]/20 rounded-full"></div>
                            <div className="h-2.5 w-16 bg-[#a78bfa]/10 rounded-full"></div>
                        </div>
                    </div>
                    <div className="w-9 h-9 bg-white/5 rounded-lg"></div>
                </div>

                {/* Sidebar Header Skeleton */}
                <div className="flex items-center justify-between mb-5 px-1 text-white/20 uppercase tracking-widest font-black text-[10px]">
                    <div className="h-2.5 w-32 bg-[#a78bfa]/10 rounded-full"></div>
                    <div className="w-4 h-4 rounded-full bg-white/5"></div>
                </div>

                {/* Suggested Suggestions List */}
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#a78bfa]/15"></div>
                            <div className="flex flex-col flex-1 min-w-0 gap-2">
                                <div className="h-3.5 w-28 bg-[#a78bfa]/20 rounded-full"></div>
                                <div className="h-2.5 w-20 bg-[#a78bfa]/10 rounded-full"></div>
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

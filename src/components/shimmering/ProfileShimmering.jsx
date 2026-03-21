import React from "react";

const ProfileShimmering = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-300 relative w-full pt-6">
            {/* Background Gradients (Subtle Dark Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto px-4 pb-20 relative z-10">

                {/* SOLID DARK PROFILE CARD */}
                <div className="bg-[#111111] border border-white/5 shadow-2xl rounded-[28px] overflow-hidden">
                    {/* Header Banner Skeleton */}
                    <div className="h-[140px] bg-white/5 animate-pulse"></div>

                    <div className="px-6 sm:px-10 pb-10">
                        {/* AVATAR & INFO HEADER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-[76px] mb-8 gap-6 relative z-10">
                            {/* Avatar Skeleton */}
                            <div className="relative w-[150px] h-[150px] rounded-full border-[6px] border-[#111111] bg-[#1a1a1a] shadow-2xl overflow-hidden shrink-0">
                                <div className="w-full h-full bg-white/10 animate-pulse"></div>
                            </div>

                            {/* User Name & Handle Skeleton */}
                            <div className="text-center sm:text-left flex-1 pb-2 w-full flex flex-col items-center sm:items-start">
                                <div className="h-8 w-48 bg-white/10 rounded-lg mb-3 animate-pulse"></div>
                                <div className="h-4 w-32 bg-white/5 rounded-md mb-4 animate-pulse"></div>
                                <div className="h-4 w-64 bg-white/5 rounded-md animate-pulse"></div>
                            </div>
                        </div>

                        {/* STATS ROW (Grid Layout) */}
                        <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-[#1a1a1a]/80 h-[88px] rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[120px] flex-1 sm:flex-none">
                                    <div className="h-2 w-12 bg-white/5 rounded mb-3 animate-pulse"></div>
                                    <div className="h-6 w-12 bg-white/10 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>

                        {/* STICKY NAVIGATION TABS skeleton */}
                        <div className="flex justify-center mb-0 sm:mb-8 pt-4">
                            <div className="flex items-center p-1.5 rounded-full border border-white/10 bg-[#111111]/80 max-w-fit mx-auto shadow-sm gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="px-6 sm:px-8 py-2">
                                        <div className="h-5 w-16 sm:w-20 bg-white/10 rounded-full animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TAB CONTENT SECTION (Posts Grid Skeleton) */}
                <div className="mt-8 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square bg-[#111111] border border-white/5 rounded-2xl overflow-hidden relative">
                                <div className="w-full h-full bg-white/5 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileShimmering;

import React from "react";

const ProfileShimmering = () => {
    return (
        <div className="w-full min-h-screen relative overflow-x-hidden pt-24 md:pt-6 bg-transparent text-white transition-all duration-500">
            {/* Cinematic Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ec4899]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="w-full max-w-2xl mx-auto px-4 pb-20 relative z-10">

                {/* PREMIUM GLASS PROFILE CARD SKELETON */}
                <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[36px] overflow-hidden animate-pulse">
                    
                    {/* Header Banner Skeleton */}
                    <div className="h-[100px] md:h-[140px] bg-white/[0.05] transition-all duration-500"></div>

                    <div className="px-6 sm:px-10 pb-6 md:pb-8">
                        {/* AVATAR & INFO HEADER */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-[56px] md:-mt-[76px] mb-4 md:mb-6 gap-6 relative z-10 transition-all duration-500">
                            {/* Avatar Skeleton */}
                            <div className="relative w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-full border-[4px] md:border-[6px] border-white/[0.03] bg-white/[0.03] shadow-2xl overflow-hidden shrink-0 backdrop-blur-md transition-all duration-500">
                                <div className="w-full h-full bg-white/10"></div>
                            </div>

                            {/* User Name & Handle Skeleton */}
                            <div className="text-center sm:text-left flex-1 pb-2 w-full flex flex-col items-center sm:items-start">
                                <div className="h-6 md:h-8 w-48 bg-white/20 rounded-lg mb-2 md:mb-3"></div>
                                <div className="h-3.5 md:h-4 w-32 bg-white/10 rounded-md mb-2 md:mb-3"></div>
                                <div className="h-3 md:h-4 w-64 bg-white/5 rounded-md opacity-60"></div>
                            </div>
                        </div>

                        {/* STATS ROW (Glass Pill Layout) */}
                        <div className="flex gap-4 md:gap-8 mb-2 md:mb-6 overflow-x-auto scrollbar-hide pb-2 transition-all duration-500">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/[0.03] backdrop-blur-xl p-3.5 md:p-6 h-[78px] md:h-[96px] rounded-[20px] md:rounded-[32px] border border-white/20 flex flex-col items-center justify-center min-w-[100px] md:min-w-[150px] flex-1 transition-all duration-500">
                                    <div className="h-2 w-10 md:w-16 bg-white/5 rounded mb-2 md:mb-4"></div>
                                    <div className="h-5 md:h-8 w-10 md:w-16 bg-white/10 rounded"></div>
                                </div>
                            ))}
                        </div>

                        {/* STICKY NAVIGATION TABS skeleton */}
                        <div className="flex justify-center py-0.5 md:py-1.5 mb-1 md:mb-4 bg-transparent -mx-4 px-4 sm:mx-0 sm:px-0 transition-all duration-300">
                            <div className="flex items-center p-1 md:p-1.5 rounded-full border border-white/20 bg-white/[0.03] max-w-fit mx-auto shadow-sm gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="px-4 md:px-8 py-2">
                                        <div className="h-3 md:h-4 w-12 sm:w-16 bg-white/10 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TAB CONTENT SECTION (Posts Grid Skeleton) */}
                <div className="mt-4 min-h-[500px]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="h-6 w-28 bg-white/20 rounded-lg"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 md:gap-4 transition-all duration-500">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="aspect-square bg-white/[0.02] border border-white/10 rounded-[16px] md:rounded-[28px] overflow-hidden relative shadow-lg">
                                <div className="w-full h-full bg-white/5"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileShimmering;

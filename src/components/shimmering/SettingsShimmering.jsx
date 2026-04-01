import React from "react";

const SettingsShimmering = () => {
    return (
        <div className="w-full min-h-screen bg-transparent text-white pt-10 px-5 pb-24 max-w-2xl mx-auto animate-pulse">
            
            {/* Header Skeleton Matching Exact Real UI Typography */}
            <div className="mb-10">
                {/* 32px height for h1 title */}
                <div className="h-8 w-40 bg-white/10 rounded-sm mb-3"></div>
                {/* Tracking-wide subtitle */}
                <div className="h-3 w-56 bg-white/5 rounded-full"></div>
            </div>

            {/* Profile Preview Skeleton - Mirroring the Backdrop-blur and Gradient Shadow */}
            <div className="mb-8 px-5 py-4 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] flex items-center gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                {/* Avatar rounded-[18px] from Settings.jsx */}
                <div className="w-14 h-14 rounded-[18px] bg-white/10 shadow-inner flex-shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded-full"></div>
                    <div className="h-3 w-40 bg-white/5 rounded-full"></div>
                </div>
                {/* CLIQ Tag Placeholder */}
                <div className="ml-auto">
                    <div className="w-10 h-5 rounded-full bg-white/5 border border-white/5"></div>
                </div>
            </div>

            {/* Account Section Skeleton - Generic Component Mapping */}
            <div className="mb-3">
                <div className="h-2.5 w-16 bg-white/10 rounded-full mb-4 mx-1"></div>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex items-center justify-between px-5 py-4 ${i !== 3 ? 'border-b border-white/5' : ''}`}>
                            <div className="flex items-center gap-4">
                                {/* rounded-2xl from real SettingRow iconBg */}
                                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <div className="w-5 h-5 bg-white/10 rounded-lg"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3.5 w-24 bg-white/10 rounded-full"></div>
                                    <div className="h-2.5 w-48 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                            <div className="w-4 h-4 rounded-full bg-white/5 mr-1"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone Section Skeleton */}
            <div className="mb-3 mt-8">
                <div className="h-2.5 w-24 bg-white/10 rounded-full mb-4 mx-1"></div>
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                    {[1, 2].map((i) => (
                        <div key={i} className={`flex items-center justify-between px-5 py-4 ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <div className="w-5 h-5 bg-white/10 rounded-lg"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3.5 w-20 bg-white/10 rounded-full"></div>
                                    <div className="h-2.5 w-40 bg-white/5 rounded-full"></div>
                                </div>
                            </div>
                            <div className="w-4 h-4 rounded-full bg-white/5 mr-1"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* App Version Skeleton Matching Branding */}
            <div className="mt-12 flex flex-col items-center gap-2">
                <div className="h-2.5 w-12 bg-white/10 rounded-full"></div>
                <div className="h-2.5 w-36 bg-white/5 rounded-full"></div>
            </div>
        </div>
    );
};

export default SettingsShimmering;

import React from "react";

const CreatePostShimmering = () => {
    return (
        <div className="w-full min-h-screen relative overflow-x-hidden pt-[80px] md:pt-4 bg-transparent text-white transition-all duration-500">
            <div className="px-4 md:px-0 max-w-full md:max-w-2xl mx-auto w-full pb-20 animate-pulse">
                {/* Header Section Skeleton */}
                <div className="flex flex-col items-start justify-start relative z-10 mb-4 px-2">
                    <div className="h-4 w-32 bg-white/10 rounded-full mb-3"></div>
                    <div className="h-10 w-48 bg-white/20 rounded-lg mb-2"></div>
                    <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
                </div>

                {/* Content Card Skeleton */}
                <div className="relative p-6 md:p-8 rounded-[40px] border border-white/20 bg-white/[0.03] backdrop-blur-3xl shadow-2xl overflow-hidden">
                    {/* Description Area Skeleton */}
                    <div className="mb-6 relative z-10">
                        <div className="h-3 w-24 bg-white/10 rounded-full mb-3 ml-2"></div>
                        <div className="h-20 w-full bg-white/5 rounded-[24px]"></div>
                    </div>

                    {/* Media Area Skeleton */}
                    <div className="mb-8 relative z-10">
                        <div className="h-3 w-16 bg-white/10 rounded-full mb-3 ml-2"></div>
                        <div className="w-full h-[220px] md:h-[260px] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-6 md:p-10 bg-white/[0.02]">
                           <div className="w-14 h-14 bg-white/10 rounded-[24px] mb-4 border border-white/10"></div>
                           <div className="h-6 w-40 bg-white/20 rounded-lg"></div>
                           <div className="h-3 w-48 bg-white/10 rounded-full mt-3"></div>
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 relative z-10">
                        <div className="h-14 w-full bg-white/5 rounded-[20px] border border-white/5"></div>
                        <div className="h-14 w-full bg-white/20 rounded-[20px] border border-white/10"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreatePostShimmering;

import React from "react";

const CreatePostShimmering = () => {
    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center pt-8">
            <div className="w-full max-w-2xl animate-pulse">

                {/* Header Skeleton */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-[50px] h-[50px] bg-white/5 rounded-2xl border border-white/5"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-32 bg-white/5 rounded-md"></div>
                    </div>
                </div>

                {/* Form Card Skeleton */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">

                    {/* Top Glow Skeleton */}
                    <div className="absolute top-0 inset-x-0 h-px bg-white/5"></div>

                    {/* Description Area Skeleton */}
                    <div className="mb-8">
                        <div className="h-3 w-24 bg-white/5 rounded-sm mb-4"></div>
                        <div className="w-full h-[148px] bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                            <div className="h-4 w-3/4 bg-white/10 rounded-md"></div>
                            <div className="h-4 w-1/2 bg-white/5 rounded-md"></div>
                            <div className="h-4 w-5/6 bg-white/5 rounded-md"></div>
                        </div>
                    </div>

                    {/* Image Area Skeleton */}
                    <div className="mb-10">
                        <div className="h-3 w-16 bg-white/5 rounded-sm mb-4"></div>
                        <div className="w-full h-[220px] bg-white/5 border border-white/5 rounded-2xl"></div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-4 pt-2">
                        <div className="flex-1 h-[52px] bg-white/5 rounded-xl border border-white/5"></div>
                        <div className="flex-1 h-[52px] bg-white/10 rounded-xl border border-white/10"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreatePostShimmering;

import React from "react";

const RequestsShimmering = () => {
    return (
        <div className="w-full min-h-screen relative overflow-x-hidden pt-24 md:pt-12 bg-transparent animate-pulse">
            <div className="px-4 md:px-0 max-w-full md:max-w-2xl mx-auto w-full pb-32">
                
                {/* Header Skeleton Matching Precise Real UI */}
                <div className="flex flex-col items-start justify-start relative z-10 mb-12">
                    <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                            {/* Zap icon skeleton */}
                            <div className="w-3.5 h-3.5 bg-white/10 rounded-full"></div>
                            {/* Discovery Module badge */}
                            <div className="h-2 w-28 bg-white/10 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex flex-row items-end justify-between w-full">
                        <div className="flex flex-col">
                            {/* "Connection" title height match (28px - 32px) */}
                            <div className="h-8 md:h-10 w-48 bg-white/10 rounded-lg mb-1"></div>
                            {/* "Requests" subtitle height match (22px - 26px) */}
                            <div className="h-6 md:h-8 w-36 bg-white/5 rounded-lg"></div>
                        </div>
                    </div>
                    
                    {/* Security Status placeholder */}
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-3 w-48 bg-white/5 rounded-full"></div>
                    </div>
                </div>

                {/* Requests List Skeletons */}
                <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="relative p-3.5 md:p-5 rounded-[20px] md:rounded-[22px] border border-white/5 bg-white/[0.03] backdrop-blur-3xl flex flex-row justify-between items-center gap-3.5 md:gap-5 shadow-2xl"
                        >
                            <div className="flex items-center gap-3.5 md:gap-5 flex-1 min-w-0">
                                {/* Avatar rounded-[14px] md:rounded-[18px] */}
                                <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[14px] md:rounded-[18px] bg-white/10 flex-shrink-0"></div>
                                
                                <div className="flex flex-col flex-1 min-w-0 space-y-2">
                                    {/* Name height match */}
                                    <div className="h-4 md:h-5 w-32 md:w-40 bg-white/10 rounded-full"></div>
                                    {/* Subtitle/Expertise height match */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-white/5"></div>
                                        <div className="h-2.5 w-20 bg-white/5 rounded-full"></div>
                                        <div className="w-1 h-1 rounded-full bg-white/5"></div>
                                        <div className="h-2.5 w-1/3 bg-white/5 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                {/* Reject Button rounded-[10px] md:rounded-[12px] */}
                                <div className="w-9 h-9 md:w-11 md:h-11 rounded-[10px] md:rounded-[12px] bg-white/5 border border-white/5"></div>
                                {/* Accept Button */}
                                <div className="w-24 md:w-32 h-9 md:h-11 rounded-[10px] md:rounded-[12px] bg-white/10"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestsShimmering;

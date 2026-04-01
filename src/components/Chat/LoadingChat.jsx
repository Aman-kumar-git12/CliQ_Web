import React from "react";

const LoadingChat = () => {
    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Header Skeleton - Matches ChatUI Header */}
            <div className="flex items-center justify-between px-4 md:px-6 h-[78px] bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden relative">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-5 bg-white/10 rounded-lg relative overflow-hidden">
                            <div className="absolute inset-0 shine-effect" />
                        </div>
                        <div className="w-20 h-3 bg-white/5 rounded-md relative overflow-hidden">
                            <div className="absolute inset-0 shine-effect" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area Skeleton */}
            <div className="flex-1 p-4 md:px-6 space-y-6 overflow-hidden">
                {/* Received Message */}
                <div className="flex flex-col gap-2 max-w-[70%]">
                    <div className="h-14 w-full bg-white/5 rounded-[24px] rounded-bl-none relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-2.5 bg-white/5 rounded-full self-start" />
                </div>

                {/* Sent Message (Right Aligned) */}
                <div className="flex flex-col gap-2 max-w-[70%] ml-auto items-end">
                    <div className="h-20 w-full bg-gradient-to-r from-white/10 to-white/5 rounded-[24px] rounded-br-none relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-2.5 bg-white/5 rounded-full self-end" />
                </div>

                {/* Received Message */}
                <div className="flex flex-col gap-2 max-w-[50%]">
                    <div className="h-12 w-full bg-white/5 rounded-[24px] rounded-bl-none relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-2.5 bg-white/5 rounded-full self-start" />
                </div>

                {/* Sent Message */}
                <div className="flex flex-col gap-2 max-w-[60%] ml-auto items-end">
                    <div className="h-14 w-full bg-gradient-to-r from-white/10 to-white/5 rounded-[24px] rounded-br-none relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-2.5 bg-white/5 rounded-full self-end" />
                </div>

                {/* Received Message */}
                <div className="flex flex-col gap-2 max-w-[80%]">
                    <div className="h-24 w-full bg-white/5 rounded-[24px] rounded-bl-none relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-2.5 bg-white/5 rounded-full self-start" />
                </div>
            </div>

            {/* Footer Input Bar Skeleton */}
            <div className="px-4 py-3 bg-white/[0.03] backdrop-blur-3xl border-t border-white/10 shrink-0 min-h-[85px] flex items-center">
                <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="flex-1 h-12 bg-white/5 rounded-[24px] border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 shine-effect" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingChat;


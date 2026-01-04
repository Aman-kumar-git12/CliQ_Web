import React from "react";
import { ArrowLeft } from "lucide-react";

const LoadingChat = () => {
    return (
        <div className="h-screen bg-black text-white flex flex-col animate-pulse">
            {/* Mobile Header Skeleton */}
            <div className="md:hidden flex items-center p-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
                <div className="mr-4 w-6 h-6 bg-neutral-800 rounded-full"></div>
                <div className="h-6 w-24 bg-neutral-800 rounded"></div>
            </div>

            {/* Chat Messages Skeleton */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Date Divider Skeleton */}
                <div className="flex justify-center mt-6 mb-4">
                    <div className="h-4 w-32 bg-neutral-800 rounded"></div>
                </div>

                {/* Left Message Skeleton */}
                <div className="flex flex-col space-y-2 max-w-[70%]">
                    <div className="h-10 w-48 bg-neutral-800 rounded-2xl rounded-tl-sm"></div>
                    <div className="h-3 w-16 bg-neutral-800 rounded opacity-50"></div>
                </div>

                {/* Right Message Skeleton */}
                <div className="flex flex-col space-y-2 max-w-[70%] ml-auto items-end">
                    <div className="h-12 w-56 bg-neutral-800 rounded-2xl rounded-tr-sm"></div>
                    <div className="h-3 w-16 bg-neutral-800 rounded opacity-50"></div>
                </div>

                {/* Left Message Skeleton */}
                <div className="flex flex-col space-y-2 max-w-[70%]">
                    <div className="h-8 w-36 bg-neutral-800 rounded-2xl rounded-tl-sm"></div>
                    <div className="h-3 w-16 bg-neutral-800 rounded opacity-50"></div>
                </div>
                {/* Right Message Skeleton */}
                <div className="flex flex-col space-y-2 max-w-[70%] ml-auto items-end">
                    <div className="h-20 w-64 bg-neutral-800 rounded-2xl rounded-tr-sm"></div>
                    <div className="h-3 w-16 bg-neutral-800 rounded opacity-50"></div>
                </div>
            </div>

            {/* Input Bar Skeleton */}
            <div className="flex items-center gap-2 p-3 border-t border-neutral-800">
                <div className="flex-1 h-10 bg-neutral-800 rounded-full"></div>
                <div className="w-10 h-10 bg-neutral-800 rounded-full"></div>
            </div>
        </div>
    );
};

export default LoadingChat;

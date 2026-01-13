import React from "react";
import { ArrowLeft } from "lucide-react";

const LoadingChat = () => {
    return (
        <div className="h-screen bg-[#000000] text-white flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center p-3 border-b border-neutral-800 bg-[#202c33] sticky top-0 z-10 h-16">
                <div className="mr-3 w-6 h-6 bg-neutral-800 rounded-full"></div>
                <div className="w-10 h-10 rounded-full bg-neutral-800"></div>
                <div className="ml-3 h-4 w-24 bg-neutral-800 rounded"></div>
            </div>

            {/* Chat Messages Skeleton */}
            <div className="flex-1 p-4 md:px-12 space-y-6 overflow-y-auto">
                <div className="flex justify-center my-4">
                    <div className="h-5 w-32 bg-[#182229] rounded-full"></div>
                </div>

                {/* Left Message Skeleton with Avatar */}
                <div className="flex items-end gap-2 max-w-[70%]">
                    <div className="w-7 h-7 bg-neutral-800 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-48 bg-[#262626] rounded-2xl rounded-tl-sm"></div>
                </div>

                {/* Right Message Skeleton */}
                <div className="flex flex-col space-y-2 max-w-[70%] ml-auto items-end">
                    <div className="h-12 w-56 bg-[#007aff] rounded-2xl rounded-tr-sm opacity-50"></div>
                </div>

                <div className="flex items-end gap-2 max-w-[70%]">
                    <div className="w-7 h-7 bg-neutral-800 rounded-full flex-shrink-0"></div>
                    <div className="h-20 w-64 bg-[#262626] rounded-2xl rounded-tl-sm"></div>
                </div>

                <div className="flex flex-col space-y-2 max-w-[70%] ml-auto items-end">
                    <div className="h-10 w-36 bg-[#007aff] rounded-2xl rounded-tr-sm opacity-50"></div>
                </div>
            </div>

            {/* Input Bar Skeleton */}
            <div className="flex items-center gap-4 p-3 bg-[#202c33]">
                <div className="w-6 h-6 bg-neutral-800 rounded-full"></div>
                <div className="w-6 h-6 bg-neutral-800 rounded-full"></div>
                <div className="flex-1 h-10 bg-[#2a3942] rounded-2xl"></div>
                <div className="w-10 h-10 bg-emerald-600 rounded-full opacity-50"></div>
            </div>
        </div>
    );
};

export default LoadingChat;

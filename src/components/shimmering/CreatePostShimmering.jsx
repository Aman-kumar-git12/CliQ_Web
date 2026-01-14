import React from "react";

const CreatePostShimmering = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 flex flex-col items-center pt-10 animate-pulse">
            <div className="w-full max-w-xl">
                {/* Title Skeleton */}
                <div className="h-8 w-40 bg-gray-300 dark:bg-neutral-800 rounded mx-auto mb-6"></div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl">
                    {/* Description Label */}
                    <div className="h-4 w-20 bg-gray-300 dark:bg-neutral-800 rounded mb-2"></div>
                    {/* Text Area */}
                    <div className="h-32 bg-gray-300 dark:bg-neutral-800 rounded-lg mt-4 w-full"></div>

                    {/* Image Placeholder */}
                    <div className="h-48 bg-gray-300 dark:bg-neutral-800 rounded-lg mt-4 w-full"></div>
                    {/* Image Upload Area Skeleton */}
                    <div className="w-full h-40 bg-gray-300 dark:bg-neutral-800 rounded-xl mb-8 border-2 border-dashed border-gray-400 dark:border-neutral-700"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        <div className="h-12 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostShimmering;

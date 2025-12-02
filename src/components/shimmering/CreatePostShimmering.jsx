import React from "react";

const CreatePostShimmering = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 flex flex-col items-center pt-10 animate-pulse">
            <div className="w-full max-w-xl">
                {/* Title Skeleton */}
                <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-6"></div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl">
                    {/* Description Label */}
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    {/* Textarea Skeleton */}
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6"></div>

                    {/* Image Label */}
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    {/* Image Upload Area Skeleton */}
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8 border-2 border-dashed border-gray-300 dark:border-gray-700"></div>

                    {/* Buttons Skeleton */}
                    <div className="flex gap-4 pt-2">
                        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostShimmering;

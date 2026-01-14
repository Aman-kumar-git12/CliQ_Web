import React from "react";

const HomeShimmering = () => {
    return (
        <div className="w-full pt-4 animate-pulse">
            {/* Repeat the skeleton 3 times */}
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-4"
                >
                    {/* Header: Avatar + Name */}
                    <div className="h-24 bg-gray-200 dark:bg-neutral-900 rounded-2xl border border-gray-300 dark:border-neutral-800 mb-6 p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-neutral-800"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            <div className="h-10 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        </div>
                    </div>

                    {/* Content Text */}
                    <div className="space-y-2 mb-4">
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>

                    {/* Image Placeholder */}
                    <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                        <div className="flex items-center gap-6">
                            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomeShimmering;

import React from "react";

const RequestsShimmering = () => {
    return (
        <div className="p-6 w-full animate-pulse">
            {/* Title Skeleton */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>

            <div className="flex flex-col gap-4 mt-4">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow flex justify-between items-center"
                    >
                        {/* Left: Avatar + Text */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                            <div className="flex flex-col gap-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>

                        {/* Right: Buttons */}
                        <div className="flex gap-2">
                            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RequestsShimmering;

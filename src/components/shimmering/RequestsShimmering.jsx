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
                        className="bg-gray-200 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 p-4 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-neutral-800"></div>

                            {/* Name & Username */}
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-3 w-20 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-800"></div>
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RequestsShimmering;

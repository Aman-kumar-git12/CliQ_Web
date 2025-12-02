import React from "react";

const ProfileShimmering = () => {
    return (
        <div className="w-full mt-0 pt-3 md:pt-4 px-3 pb-10 animate-pulse">
            <div className="w-full">
                {/* PROFILE CARD SKELETON */}
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-2xl rounded-2xl p-6 sm:p-8">
                    {/* Header: Avatar + Name */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex flex-col gap-3">
                            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-3 mb-8">
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                </div>

                {/* POSTS GRID SKELETON */}
                <div className="mt-10">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="bg-gray-200 dark:bg-gray-800 rounded-xl h-40 sm:h-48"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileShimmering;

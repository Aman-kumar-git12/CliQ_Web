import React from "react";

const FindPeopleShimmering = () => {
    return (
        <div className="w-full animate-pulse">
            {/* Search Bar Skeleton */}
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-6"></div>

            {/* Heading Skeleton */}
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4 px-1"></div>

            {/* User List Skeleton */}
            <div className="flex flex-col gap-1">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                        key={item}
                        className="flex items-center justify-between p-3 rounded-xl"
                    >
                        {/* Left Section: Avatar + Text */}
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>

                        {/* Follow Button Skeleton */}
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FindPeopleShimmering;

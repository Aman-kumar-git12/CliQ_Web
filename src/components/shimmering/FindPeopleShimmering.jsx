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
                        className="bg-gray-200 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 p-6 rounded-2xl flex flex-col items-center shadow-sm"
                    >
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-neutral-800 mb-4"></div>

                        {/* Name & Username */}
                        <div className="h-5 w-32 bg-gray-300 dark:bg-neutral-800 rounded mb-2"></div>
                        <div className="h-4 w-20 bg-gray-300 dark:bg-neutral-800 rounded mb-6"></div>

                        {/* Buttons */}
                        <div className="flex w-full gap-2 mt-auto">
                            <div className="h-10 flex-1 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                            <div className="h-10 flex-1 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        </div>
                    </div>))}
            </div>
        </div>
    );
};

export default FindPeopleShimmering;

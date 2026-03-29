import React from "react";

const HomeShimmering = () => {
    return (
        <div className="flex justify-center gap-12 w-full pt-8 px-4">
            {/* FEED COLUMN SKELETON */}
            <div className="flex-grow max-w-[600px] w-full">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="flex flex-col mb-8 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg relative p-4 animate-pulse"
                    >
                        <div className="flex gap-4">
                            {/* LEFT: Avatar + Line */}
                            <div className="flex flex-col items-center">
                                <div className="w-11 h-11 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"></div>
                                <div className="w-[2px] flex-1 bg-neutral-200 dark:bg-neutral-800 my-2 rounded-full" />
                            </div>

                            {/* RIGHT: CONTENT */}
                            <div className="flex-1 min-w-0">
                                {/* Header: Username + Time */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                        <div className="h-3 w-3 bg-neutral-200 dark:bg-neutral-900 rounded-full"></div>
                                        <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                    </div>
                                    <div className="h-4 w-6 bg-neutral-200 dark:bg-neutral-900 rounded-full"></div>
                                </div>

                                {/* Main Content Text */}
                                <div className="px-0 py-1 mb-4 flex flex-col gap-2">
                                    <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                    <div className="h-3.5 w-5/6 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                    <div className="h-3.5 w-2/3 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                </div>

                                {/* IMAGE AREA */}
                                <div className="w-full h-[500px] bg-neutral-100 dark:bg-neutral-950/50 rounded-xl mb-4 border border-neutral-200 dark:border-neutral-900"></div>

                                {/* ACTIONS BAR */}
                                <div className="flex items-center gap-5 mt-2">
                                    <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                                    <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                                    <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                                    <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                                </div>

                                {/* LIKES & COMMENTS INFO */}
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT SIDEBAR COLUMN SKELETON */}
            <div className="hidden lg:block w-[320px] shrink-0 sticky top-8 h-fit animate-pulse">
                {/* Current User Profile Card */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl mb-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                            <div className="h-2.5 w-16 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                        </div>
                    </div>
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg h-9 w-9"></div>
                </div>

                {/* Curation Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="h-3 w-40 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                    <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                </div>

                {/* Suggested Users */}
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-900"></div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 gap-2">
                                <div className="h-3.5 w-28 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                                <div className="h-2.5 w-20 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                            </div>
                            <div className="p-2 ml-2 bg-neutral-100 dark:bg-neutral-900 rounded-xl h-9 w-9"></div>
                        </div>
                    ))}
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex flex-wrap justify-center gap-4 px-4">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="h-2.5 w-12 bg-neutral-200 dark:bg-neutral-900 rounded-md"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeShimmering;

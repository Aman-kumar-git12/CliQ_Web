import React from "react";

const ProfileShimmering = () => {
    return (
        <div className="w-full mt-0 pt-3 md:pt-4 px-3 pb-10 animate-pulse">
            <div className="w-full">
                {/* Profile Card */}
                <div className="bg-white/80 dark:bg-[#111] backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-xl rounded-3xl overflow-hidden mb-8">
                    {/* Header Banner */}
                    <div className="h-32 bg-gray-300 dark:bg-neutral-900 animate-pulse"></div>

                    <div className="px-6 pb-8">
                        <div className="flex flex-col items-center -mt-12 mb-6">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-neutral-800 border-4 border-white dark:border-[#111] shadow-2xl mb-4"></div>
                            {/* Name & Handle */}
                            <div className="h-8 w-48 bg-gray-300 dark:bg-neutral-800 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-xl flex flex-col items-center space-y-2 border border-gray-200 dark:border-neutral-800">
                                    <div className="h-3 w-12 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                    <div className="h-6 w-8 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileShimmering;

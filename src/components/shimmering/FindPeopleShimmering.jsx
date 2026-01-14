export default function FindPeopleShimmering({ count = 8 }) {
    return (
        <div className="w-full animate-pulse space-y-2">

            {/* Header Shimmer (Optional, if we want to mimic the 'Search Results' text) */}
            {/* <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded mb-4 px-1"></div> */}

            <div className="flex flex-col gap-1">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl border border-transparent"
                    >
                        {/* Left Section: Avatar + Text */}
                        <div className="flex items-center gap-3 flex-1">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-800 shrink-0"></div>

                            {/* Text Info */}
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-3 w-20 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            </div>
                        </div>

                        {/* Right Section: Button */}
                        <div className="h-8 w-24 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

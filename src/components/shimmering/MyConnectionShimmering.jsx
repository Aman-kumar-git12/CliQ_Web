export default function MyConnectionShimmering({ count = 6 }) {
    return (
        <div className="w-full relative px-2 animate-pulse">

            {/* Header Shimmer */}
            <div className="h-8 w-48 bg-gray-300 dark:bg-neutral-800 rounded-lg mb-6 mt-4"></div>

            <div className="flex flex-col gap-2">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-200 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800"
                    >
                        {/* Left Section - Profile Info */}
                        <div className="flex items-center gap-3 flex-1">
                            {/* Avatar Circle */}
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-neutral-800"></div>

                            <div className="flex flex-col gap-2 flex-1">
                                {/* Name Line */}
                                <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                {/* Username Line */}
                                <div className="h-3 w-24 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            </div>
                        </div>

                        {/* Right Section - Button Placeholder */}
                        <div className="h-9 w-24 bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function EditProfileShimmering() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black relative overflow-hidden flex items-center justify-center p-4 animate-pulse">

            <div className="w-full max-w-2xl relative z-10">
                {/* Glassmorphic Card Shimmer */}
                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-10">

                    {/* Header Shimmer */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="h-8 w-48 bg-gray-300 dark:bg-neutral-800 rounded mb-2"></div>
                            <div className="h-4 w-64 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-800"></div>
                    </div>

                    {/* Form Fields Shimmer */}
                    <div className="space-y-6">
                        {/* First & Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        </div>

                        {/* Age & Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="h-4 w-16 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                                <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <div className="h-4 w-40 bg-gray-300 dark:bg-neutral-800 rounded"></div>
                            <div className="h-12 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        </div>

                        {/* Button */}
                        <div className="pt-4">
                            <div className="h-14 w-full bg-gray-300 dark:bg-neutral-800 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

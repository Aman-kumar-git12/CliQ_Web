export default function MyConnectionShimmering({ count = 8 }) {
    return (
        <div className="w-full h-full flex flex-col bg-transparent animate-pulse overflow-hidden select-none">
            {/* Header Shimmer Refinement */}
            <div className="pt-8 px-6 pb-6 border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <div className="h-8 w-40 bg-[#a78bfa]/10 rounded-xl mb-6 shadow-sm border border-[#a78bfa]/5"></div>
                
                {/* Search Bar Placeholder */}
                <div className="h-[52px] w-full bg-white/[0.03] border border-[#a78bfa]/10 rounded-[22px] flex items-center px-4">
                    <div className="w-5 h-5 bg-[#a78bfa]/10 rounded-full mr-3"></div>
                    <div className="w-32 h-3.5 bg-[#a78bfa]/10 rounded-full"></div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 px-2 py-4 space-y-1">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 px-4 h-[88px] rounded-[24px] bg-white/[0.02] border border-white/5"
                    >
                        {/* Avatar Skeleton */}
                        <div className="shrink-0 relative">
                            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#a78bfa]/20 to-[#8b5cf6]/10 border border-[#a78bfa]/10 p-[1px] shadow-lg">
                                <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm"></div>
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-baseline mb-3">
                                {/* Name Line */}
                                <div className="h-4 w-32 bg-[#a78bfa]/20 rounded-full"></div>
                                {/* Time Line */}
                                <div className="h-2.5 w-12 bg-[#a78bfa]/10 rounded-full"></div>
                            </div>
                            
                            {/* Message Line */}
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-48 bg-[#a78bfa]/10 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

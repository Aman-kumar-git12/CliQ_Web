import { motion } from "framer-motion";

export default function MatchCardShimmering() {
    return (
        <div className="relative w-full max-w-full sm:max-w-md md:max-w-md min-h-[480px] md:min-h-[600px] bg-[#0a0510]/60 backdrop-blur-3xl border border-white/10 rounded-[28px] md:rounded-[40px] p-8 flex flex-col items-center overflow-hidden animate-pulse">
            {/* Mesh Gradient Placeholder: Purple Theme */}
            <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-[#8b5cf6]/10 to-transparent"></div>
            
            {/* Avatar Shimmer */}
            <div className="relative z-10 mt-4 mb-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-purple-500/10 border-4 border-white/5 shadow-[0_0_30px_rgba(139,92,246,0.1)]"></div>
            </div>

            {/* Name & Subtitle Shimmer */}
            <div className="space-y-3 flex flex-col items-center w-full mb-8">
                <div className="h-7 w-40 bg-purple-500/20 rounded-lg"></div>
                <div className="h-3 w-28 bg-purple-500/10 rounded-full opacity-60"></div>
            </div>

            {/* Tags Shimmer */}
            <div className="flex gap-2 mb-10">
                <div className="h-6 w-16 bg-purple-500/10 rounded-full"></div>
                <div className="h-6 w-20 bg-purple-500/10 rounded-full"></div>
            </div>

            {/* Bio Shimmer */}
            <div className="space-y-2 w-full flex flex-col items-center mb-10">
                <div className="h-2.5 w-[75%] bg-purple-500/10 rounded-full opacity-40"></div>
                <div className="h-2.5 w-[55%] bg-purple-500/10 rounded-full opacity-30"></div>
            </div>

            {/* Actions Shimmer */}
            <div className="mt-auto w-full space-y-8 flex flex-col items-center">
                <div className="h-14 w-full max-w-[200px] bg-purple-500/20 rounded-[22px] opacity-50"></div>
                
                <div className="flex items-center gap-10">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-white/5"></div>
                    <div className="w-14 h-14 rounded-full bg-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]"></div>
                </div>
            </div>

            {/* Sweep Effect: Purple Tint */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-purple-500/5 to-transparent skew-x-12"
            />
        </div>
    );
}

import { motion } from "framer-motion";

export default function MatchCardShimmering() {
    return (
        <div className="relative w-full max-w-[24rem] sm:max-w-md h-[600px] bg-neutral-900/40 backdrop-blur-3xl border border-white/5 rounded-[34px] p-8 flex flex-col items-center overflow-hidden animate-pulse">
            {/* Mesh Gradient Placeholder */}
            <div className="absolute top-0 left-0 w-full h-44 bg-neutral-800/30"></div>
            
            {/* Avatar Shimmer */}
            <div className="relative z-10 mt-4 mb-6">
                <div className="w-28 h-28 rounded-full bg-neutral-800 border-4 border-neutral-700/50"></div>
            </div>

            {/* Name & Subtitle Shimmer */}
            <div className="space-y-3 flex flex-col items-center w-full mb-10">
                <div className="h-8 w-48 bg-neutral-800 rounded-lg"></div>
                <div className="h-4 w-32 bg-neutral-800 rounded-full opacity-60"></div>
            </div>

            {/* Bio Shimmer */}
            <div className="space-y-2 w-full flex flex-col items-center mb-12">
                <div className="h-3 w-[80%] bg-neutral-800 rounded-full opacity-40"></div>
                <div className="h-3 w-[60%] bg-neutral-800 rounded-full opacity-30"></div>
            </div>

            {/* Actions Shimmer */}
            <div className="mt-auto w-full space-y-8 flex flex-col items-center">
                <div className="h-10 w-44 bg-neutral-800 rounded-full opacity-50"></div>
                
                <div className="flex items-center gap-10">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 opacity-40"></div>
                    <div className="w-20 h-20 rounded-full bg-neutral-800"></div>
                </div>
            </div>

            {/* Sweep Effect */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
        </div>
    );
}

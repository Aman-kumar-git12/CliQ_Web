import React from 'react';
import { motion } from 'framer-motion';

const ShimmerBase = ({ className }) => (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            animate={{ x: ['-150%', '150%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
    </div>
);

export default function IndividualPostShimmering() {
    return (
        <div className="min-h-screen bg-[#08080C] text-white relative overflow-x-hidden no-scrollbar transition-all duration-500">
            {/* Cinematic Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#8b5cf6]/10 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ec4899]/5 rounded-full blur-[140px] pointer-events-none z-0" />
            
            {/* Grid Overlay */}
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
                style={{ 
                    backgroundImage: `linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)`,
                    backgroundSize: '50px 50px' 
                }} 
            />

            <main className="w-full max-w-[640px] mx-auto pt-6 md:pt-10 pb-24 relative z-10">
                {/* Navigation Row */}
                <div className="px-4 mb-6 flex items-center justify-between">
                    <ShimmerBase className="w-24 h-10 rounded-full" />
                    <div className="flex gap-2">
                        <ShimmerBase className="w-9 h-9 rounded-full" />
                    </div>
                </div>

                {/* Post Body */}
                <article className="px-4 py-2 space-y-3">
                    {/* User Profile Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <ShimmerBase className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                                <ShimmerBase className="w-40 h-4 rounded-md" />
                                <ShimmerBase className="w-24 h-3 rounded-md opacity-50" />
                            </div>
                        </div>
                        <ShimmerBase className="w-20 h-8 rounded-full" />
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-3">
                        <ShimmerBase className="w-full h-4 rounded-md" />
                        <ShimmerBase className="w-[90%] h-4 rounded-md" />
                        <ShimmerBase className="w-[85%] h-4 rounded-md" />
                    </div>

                    {/* Media Block (Image/Video Placeholder) */}
                    <ShimmerBase className="w-full h-[400px] md:h-[500px] rounded-[2rem]" />

                    {/* Meta Info */}
                    <ShimmerBase className="w-32 h-3 rounded-md opacity-30" />

                    {/* Interaction Buttons */}
                    <div className="flex items-center justify-between py-4 border-y border-white/[0.05]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <ShimmerBase className="w-10 h-10 rounded-full" />
                                <ShimmerBase className="w-6 h-3 rounded-md opacity-40 shrink-0" />
                            </div>
                        ))}
                    </div>

                    {/* Comment Section (Partial) */}
                    <div className="flex items-start space-x-3 pt-4 opacity-50">
                        <ShimmerBase className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-3">
                            <ShimmerBase className="w-full h-12 rounded-2xl" />
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

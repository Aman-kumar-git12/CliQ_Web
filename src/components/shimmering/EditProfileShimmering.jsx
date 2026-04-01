import React from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

const ShimmerBar = ({ className, baseColor = "bg-white/5", shimmerColor = "via-white/10" }) => (
    <div className={`relative overflow-hidden ${baseColor} ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent ${shimmerColor} to-transparent" />
    </div>
);

export default function EditProfileShimmering() {
    return (
        <div className="min-h-screen bg-transparent relative overflow-x-hidden pt-24 md:pt-12 pb-24 md:pb-20 no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />

            <div className="px-3 md:px-0 max-w-full md:max-w-2xl mx-auto w-full relative z-10">
                {/* HEADER SHIMMER - Structural Matching */}
                <div className="flex flex-col items-start justify-start mb-8 md:mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="fill-[#8b5cf6]/20 text-[#8b5cf6]" />
                        <ShimmerBar className="h-3 w-28 rounded-full" />
                    </div>
                    <div className="h-[22px] md:h-[32px] flex items-center">
                        <ShimmerBar className="h-6 md:h-8 w-24 md:w-32 rounded-lg" />
                    </div>
                    <div className="h-[14px] md:h-[26px] -mt-1 flex items-center">
                        <ShimmerBar className="h-4 md:h-6 w-32 md:w-48 rounded-lg" />
                    </div>
                </div>

                {/* CARD SHIMMER - Using exact same card classes */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[32px] overflow-hidden p-5 md:p-10 relative">
                    <div className="space-y-5 md:space-y-6">
                        {/* Grid for Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                    <ShimmerBar className="h-2.5 w-16 rounded-full" />
                                </div>
                                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                    <ShimmerBar className="w-1/3 h-full rounded-md opacity-20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                    <ShimmerBar className="h-2.5 w-16 rounded-full" />
                                </div>
                                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                    <ShimmerBar className="w-1/2 h-full rounded-md opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* Full Width Email */}
                        <div className="space-y-2">
                            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                <ShimmerBar className="h-2.5 w-24 rounded-full" />
                            </div>
                            <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                <ShimmerBar className="w-3/4 h-full rounded-md opacity-20" />
                            </div>
                        </div>

                        {/* Grid for Age & Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                    <ShimmerBar className="h-2.5 w-12 rounded-full" />
                                </div>
                                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                    <ShimmerBar className="w-1/4 h-full rounded-md opacity-20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                    <ShimmerBar className="h-2.5 w-32 rounded-full" />
                                </div>
                                <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                    <ShimmerBar className="w-2/3 h-full rounded-md opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* Profile Image URL */}
                        <div className="space-y-2">
                            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] ml-1 opacity-30">
                                <ShimmerBar className="h-2.5 w-36 rounded-full" />
                            </div>
                            <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 md:px-5 md:py-3 h-[46px] md:h-[50px]">
                                <ShimmerBar className="w-full h-full rounded-md opacity-20" />
                            </div>
                        </div>

                        {/* BUTTON SHIMMER - Exact visual weight matching */}
                        <div className="pt-6">
                            <div className="w-full bg-white/10 h-[52px] md:h-[64px] rounded-2xl overflow-hidden relative">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

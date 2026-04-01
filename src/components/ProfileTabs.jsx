import React from "react";
import { motion } from "framer-motion";

/**
 * Shared Profile Tabs navigation component.
 */
const ProfileTabs = ({
    activeTab,
    onTabChange,
    tabs = [
        { id: "posts", label: "Posts" },
        { id: "connections", label: "Connections" },
        { id: "groups", label: "Groups" },
        { id: "expertise", label: "Expertise" }
    ]
}) => {
    return (
        <div className="sticky top-[70px] md:top-4 z-40 flex justify-center py-1.5 md:py-1.5 mb-1 bg-[#0f041e]/80 backdrop-blur-2xl md:bg-transparent -mx-4 md:mx-0 px-2 md:px-0 border-b border-purple-500/20 md:border-none transition-all duration-300 shadow-[0_10px_30px_rgba(88,28,135,0.2)] md:shadow-none">
            <div className="flex items-center p-1 md:p-1.5 md:rounded-full md:border md:border-white/10 md:bg-white/[0.03] md:backdrop-blur-3xl w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

                {/* Subtle Glow Overlay (Desktop only) */}
                <div className="hidden md:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {tabs.map((tab, idx, arr) => (
                    <React.Fragment key={tab.id}>
                        {idx !== 0 && (
                            <div className={`hidden md:block w-px h-3 mx-1 shrink-0 transition-colors duration-300 ${activeTab === tab.id || (idx > 0 && activeTab === arr[idx - 1].id)
                                    ? "bg-transparent"
                                    : "bg-white/10"
                                }`}></div>
                        )}
                        <button
                            onClick={() => onTabChange(tab.id)}
                            className={`relative px-3 sm:px-4 md:px-8 py-1.5 md:py-2.5 md:rounded-full text-[10px] md:text-[13px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 whitespace-nowrap shrink-0 flex-1 md:flex-none ${activeTab === tab.id
                                    ? "text-purple-200 md:text-white bg-purple-500/10 md:bg-white/[0.08] shadow-[0_0_20px_rgba(168,85,247,0.1)] md:shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-xl md:rounded-full scale-[1.02] md:scale-105 active:scale-95 border border-purple-500/20 md:border-none"
                                    : "text-purple-300/40 hover:text-purple-200 hover:bg-purple-500/5 md:hover:bg-white/[0.04] active:scale-95 rounded-xl md:rounded-full"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab-line"
                                    className="absolute bottom-[-8px] md:bottom-0 left-[20%] right-[20%] h-[2px] md:h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-400 to-purple-500/0 md:via-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                                />
                            )}
                            <span className="relative z-10 italic">{tab.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProfileTabs;

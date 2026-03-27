import React from "react";

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
        <div className="sticky top-0 z-50 flex justify-center py-4 mb-8 bg-[#0A0A0A]/40 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center p-1.5 rounded-full border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md max-w-fit mx-auto shadow-sm">
                {tabs.map((tab, idx, arr) => (
                    <React.Fragment key={tab.id}>
                        {idx !== 0 && (
                            <div className={`w-[1px] h-4 mx-1 shrink-0 transition-colors duration-300 ${
                                activeTab === tab.id || (idx > 0 && activeTab === arr[idx - 1].id)
                                    ? "bg-transparent"
                                    : "bg-white/10"
                            }`}></div>
                        )}
                        <button
                            onClick={() => onTabChange(tab.id)}
                            className={`relative px-6 sm:px-8 py-2 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden ${
                                activeTab === tab.id
                                    ? "text-white bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.02)] scale-105"
                                    : "text-[#8e8e93] hover:text-gray-200 border border-transparent"
                            }`}
                        >
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-blue-500/0 via-purple-400 to-indigo-500/0 shadow-[0_0_12px_2px_rgba(168,85,247,0.7)]" />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
            {/* Gradient underline for total width context */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
        </div>
    );
};

export default ProfileTabs;

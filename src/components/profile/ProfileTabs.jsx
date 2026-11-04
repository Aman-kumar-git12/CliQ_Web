import React from "react";
import { motion } from "framer-motion";
import { EASE_SOFT } from "../common/motionPresets";

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
        { id: "expertise", label: "Expertise" },
    ],
}) => {
    return (
        <div className="sticky top-[70px] md:top-4 z-40 flex justify-center py-1.5 mb-1 bg-surface-night/80 backdrop-blur-2xl md:bg-transparent -mx-4 md:mx-0 px-2 md:px-0 border-b border-line md:border-none shadow-soft md:shadow-none">
            <div
                role="tablist"
                className="flex items-center p-1 md:p-1.5 md:rounded-full md:border md:border-line md:bg-white/[0.03] md:backdrop-blur-2xl md:shadow-soft w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth"
            >
                {tabs.map((tab, idx, arr) => (
                    <React.Fragment key={tab.id}>
                        {idx !== 0 && (
                            <div
                                className={`hidden md:block w-px h-3 mx-1 shrink-0 transition-colors duration-200 ease-soft ${
                                    activeTab === tab.id || (idx > 0 && activeTab === arr[idx - 1].id)
                                        ? "bg-transparent"
                                        : "bg-line-strong"
                                }`}
                            ></div>
                        )}
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative px-3 sm:px-4 md:px-6 py-2 rounded-xl md:rounded-full text-[13px] font-semibold cliq-press whitespace-nowrap shrink-0 flex-1 md:flex-none focus-ring ${
                                activeTab === tab.id
                                    ? "text-white"
                                    : "text-ink-300 hover:text-ink-100 hover:bg-white/[0.04]"
                            }`}
                        >
                            {activeTab === tab.id && (
                                <>
                                    {/* Active pill + underline glide between tabs instead of jumping */}
                                    <motion.span
                                        layoutId="active-tab-pill"
                                        transition={{ duration: 0.25, ease: EASE_SOFT }}
                                        className="absolute inset-0 rounded-xl md:rounded-full bg-brand/10 md:bg-white/[0.07] border border-brand/20 md:border-line-soft md:shadow-soft"
                                    />
                                    <motion.span
                                        layoutId="active-tab-line"
                                        transition={{ duration: 0.25, ease: EASE_SOFT }}
                                        className="absolute bottom-[-8px] md:bottom-0 left-[20%] right-[20%] h-[2px] md:h-[1px] bg-gradient-to-r from-brand/0 via-brand-light to-brand/0"
                                    />
                                </>
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProfileTabs;

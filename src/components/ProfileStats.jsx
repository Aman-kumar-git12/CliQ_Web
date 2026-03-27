import React from "react";

/**
 * Shared Profile Stats component for displaying Posts, Connections, and Groups counts.
 */
const ProfileStats = ({ 
    stats = { posts: 0, connections: 0, groups: 0 },
    onStatClick = () => {}
}) => {
    return (
        <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide">
            {[
                { id: "posts", label: "Posts", value: stats.posts },
                { id: "connections", label: "Connections", value: stats.connections },
                { id: "groups", label: "Groups", value: stats.groups }
            ].map((stat) => (
                <div 
                    key={stat.id}
                    onClick={() => onStatClick?.(stat.id)}
                    className="bg-[#1a1a1a]/80 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center min-w-[120px] flex-1 sm:flex-none cursor-pointer hover:bg-[#252525] transition-all"
                >
                    <span className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-[0.1em] mb-1.5">{stat.label}</span>
                    <span className="text-2xl font-bold tracking-tight text-white">{stat.value || "0"}</span>
                </div>
            ))}
        </div>
    );
};

export default ProfileStats;

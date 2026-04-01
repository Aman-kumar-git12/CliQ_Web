import React from "react";

/**
 * Shared Profile Stats component for displaying Posts, Connections, and Groups counts.
 */
const ProfileStats = ({
    stats = { posts: 0, connections: 0, groups: 0 },
    onStatClick = () => { }
}) => {
    return (
        <div className="flex gap-2 md:gap-6 mb-2 md:mb-6 px-4 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {[
                { id: "posts", label: "Posts", value: stats.posts },
                { id: "connections", label: "Network", value: stats.connections },
                { id: "groups", label: "Groups", value: stats.groups }
            ].map((stat) => (
                <div
                    key={stat.id}
                    onClick={() => onStatClick?.(stat.id)}
                    className="relative bg-[#150a26]/80 md:bg-white/[0.03] backdrop-blur-xl border border-purple-500/20 md:border-white/10 p-2.5 md:p-6 rounded-2xl md:rounded-[32px] flex flex-col items-center justify-center text-center flex-1 cursor-pointer hover:bg-white/[0.06] transition-all group active:scale-95 shadow-[0_10px_30px_rgba(168,85,247,0.1)] md:shadow-xl overflow-hidden duration-500"
                >
                    {/* Inner Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <span className="relative z-10 text-[#8e8e93] text-[9px] md:text-[11px] uppercase font-bold md:font-black tracking-widest md:tracking-[0.2em] mb-0.5 md:mb-1.5 group-hover:text-white/80 transition-colors">{stat.label}</span>
                    <span className="relative z-10 text-[18px] md:text-3xl font-black tracking-tight text-white group-hover:scale-110 transition-transform">{stat.value || "0"}</span>
                </div>
            ))}
        </div>
    );
};

export default ProfileStats;

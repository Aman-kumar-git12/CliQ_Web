import { formatCompactCount } from "../../utils/profileDisplay";

/**
 * Shared Profile Stats component for displaying Posts, Connections, and Groups counts.
 * Cards are only clickable when onStatClick is passed; it receives "posts" | "connections" | "groups".
 */
const ProfileStats = ({ stats = { posts: 0, connections: 0, groups: 0 }, onStatClick }) => {
    const items = [
        { id: "posts", label: "Posts", value: stats.posts },
        { id: "connections", label: "Connections", value: stats.connections },
        { id: "groups", label: "Groups", value: stats.groups },
    ];

    return (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-2 md:mb-6">
            {items.map((stat) => {
                const count = Number(stat.value) || 0;
                const Tag = onStatClick ? "button" : "div";
                return (
                    <Tag
                        key={stat.id}
                        {...(onStatClick && {
                            type: "button",
                            onClick: () => onStatClick(stat.id),
                            "aria-label": `${count.toLocaleString()} ${stat.label}, show ${stat.label.toLowerCase()}`,
                        })}
                        title={count >= 1000 ? count.toLocaleString() : undefined}
                        className={`min-w-0 flex flex-col items-center justify-center text-center rounded-2xl border border-line bg-white/[0.02] px-2 py-3 md:py-4 ${
                            onStatClick
                                ? "cursor-pointer cliq-press hover:bg-white/[0.05] hover:border-line-strong focus-ring"
                                : ""
                        }`}
                    >
                        <span className="text-lg md:text-2xl font-semibold tracking-tight text-white tabular-nums">
                            {formatCompactCount(count)}
                        </span>
                        <span className="mt-0.5 text-xs md:text-[13px] text-ink-300 truncate max-w-full">
                            {stat.label}
                        </span>
                    </Tag>
                );
            })}
        </div>
    );
};

export default ProfileStats;

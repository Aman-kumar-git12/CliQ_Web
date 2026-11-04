/** Groups tab of a public profile: heading, loading skeleton, empty state and group cards. */
import { UsersRound } from "lucide-react";
import { ProfileEmptyState, ProfileSectionHeading } from "./ProfileSection";

export default function PublicProfileGroupsTab({ groups, loadingGroups }) {
    return (
        <section>
            <ProfileSectionHeading title="Groups" count={loadingGroups ? undefined : groups.length} />
            {loadingGroups ? (
                <div
                    role="status"
                    aria-label="Loading groups"
                    aria-busy="true"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3"
                >
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-[72px] bg-white/[0.03] border border-line-soft rounded-2xl motion-safe:animate-pulse"
                        />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <ProfileEmptyState
                    icon={UsersRound}
                    title="No groups yet"
                    hint="Public groups they join will show up here."
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            // Not a link (groups have no public page), so no hover state that would suggest one
                            className="flex items-center gap-3 md:gap-4 p-3 md:p-3.5 bg-white/[0.02] border border-line-soft rounded-2xl"
                        >
                            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand to-brand-pink flex items-center justify-center text-white font-semibold text-base md:text-lg shadow-soft shrink-0 overflow-hidden">
                                {group.image ? (
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src={group.image}
                                        alt={group.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    group.name?.charAt(0) || "G"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-white truncate leading-tight">
                                    {group.name || "Unnamed Group"}
                                </h3>
                                <p className="text-xs text-ink-300 mt-0.5">
                                    {group.participantIds?.length || 0} Members
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

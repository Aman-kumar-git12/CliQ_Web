/** Groups tab of a public profile: heading, loading skeleton, empty state and group cards. */

export default function PublicProfileGroupsTab({ groups, loadingGroups }) {
    return (
        <div className="space-y-4 md:space-y-6 px-3 md:px-0">
            <div className="flex items-center justify-between mb-3 md:mb-5 px-1 md:px-0">
                <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                    Groups
                    <span className="text-[10px] md:text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                        {groups.length}
                    </span>
                </h2>
            </div>
            {loadingGroups ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-20 mx-3 md:mx-0 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 flex flex-col items-center gap-4">
                    <p className="text-white/30 font-black uppercase tracking-widest italic">No groups found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="group relative flex items-center gap-3 md:gap-4 p-3.5 md:p-4 bg-white/[0.03] border border-white/5 rounded-2xl transition-all hover:bg-white/10"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-[15px] md:text-lg shadow-lg shrink-0 overflow-hidden">
                                {group.image ? (
                                    <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                                ) : (
                                    group.name?.charAt(0) || "G"
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[13px] md:text-sm text-white truncate leading-tight">
                                    {group.name || "Unnamed Group"}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {group.participantIds?.length || 0} Members
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

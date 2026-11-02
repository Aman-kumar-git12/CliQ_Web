/** Connections tab of a public profile: heading, loading skeleton, empty state and connection list. */
import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/avatar";

export default function PublicProfileConnectionsTab({ connections, loadingConnections, currentUserId }) {
    return (
        <div className="space-y-4 md:space-y-6 px-3 md:px-0">
            <div className="flex items-center justify-between mb-3 md:mb-5 px-1 md:px-0">
                <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                    Connections
                    <span className="text-[10px] md:text-sm font-normal text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                        {connections.length}
                    </span>
                </h2>
            </div>
            {loadingConnections ? (
                <div role="status" aria-label="Loading connections" aria-busy="true" className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl motion-safe:animate-pulse"
                        />
                    ))}
                </div>
            ) : connections.length === 0 ? (
                <div className="text-center py-20 mx-3 md:mx-0 bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10">
                    <p className="text-white/30 font-black uppercase tracking-widest italic">No connections yet</p>
                </div>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    {connections.map((conn) => (
                        <Link
                            to={conn.id === currentUserId ? "/profile" : `/user/${conn.id}`}
                            key={conn.id}
                            className="group relative flex items-center justify-between p-3.5 md:p-4 bg-white/[0.03] border border-white/5 rounded-2xl transition-all hover:bg-white/10"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <img
                                    loading="lazy"
                                    decoding="async"
                                    src={conn.imageUrl || DEFAULT_AVATAR}
                                    alt={[conn.firstname, conn.lastname].filter(Boolean).join(" ")}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/10 shadow-lg"
                                />
                                <div className="flex flex-col">
                                    <h3 className="text-[13px] md:text-sm font-bold text-white leading-tight">
                                        {conn.firstname} {conn.lastname}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        @
                                        {conn.username ||
                                            `${conn.firstname.toLowerCase()}_${conn.lastname.toLowerCase()}`}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

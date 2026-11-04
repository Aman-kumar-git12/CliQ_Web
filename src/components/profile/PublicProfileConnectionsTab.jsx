/** Connections tab of a public profile: heading, loading skeleton, empty state and connection list. */
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { DEFAULT_AVATAR } from "../../utils/avatar";
import { ProfileEmptyState, ProfileSectionHeading } from "./ProfileSection";

export default function PublicProfileConnectionsTab({ connections, loadingConnections, currentUserId }) {
    return (
        <section>
            <ProfileSectionHeading title="Connections" count={loadingConnections ? undefined : connections.length} />
            {loadingConnections ? (
                <div role="status" aria-label="Loading connections" aria-busy="true" className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-[72px] bg-white/[0.03] border border-line-soft rounded-2xl motion-safe:animate-pulse"
                        />
                    ))}
                </div>
            ) : connections.length === 0 ? (
                <ProfileEmptyState
                    icon={Users}
                    title="No connections yet"
                    hint="People they connect with will show up here."
                />
            ) : (
                <div className="space-y-2">
                    {connections.map((conn) => (
                        <Link
                            to={conn.id === currentUserId ? "/profile" : `/user/${conn.id}`}
                            key={conn.id}
                            className="group flex items-center gap-3 md:gap-4 p-3 md:p-3.5 bg-white/[0.02] border border-line-soft rounded-2xl no-underline hover:bg-white/[0.04] hover:border-line cliq-transition focus-ring"
                        >
                            <img
                                loading="lazy"
                                decoding="async"
                                src={conn.imageUrl || DEFAULT_AVATAR}
                                alt={[conn.firstname, conn.lastname].filter(Boolean).join(" ")}
                                className="w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full object-cover border border-line group-hover:border-brand/30 cliq-transition"
                            />
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-sm font-medium text-white leading-tight truncate">
                                    {conn.firstname} {conn.lastname}
                                </h3>
                                <p className="text-xs text-ink-300 truncate mt-0.5">
                                    @{conn.username || `${conn.firstname.toLowerCase()}_${conn.lastname.toLowerCase()}`}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}

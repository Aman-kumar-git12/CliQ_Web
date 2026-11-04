import { useEffect, useState } from "react";
import * as connectionsApi from "../../api/connections";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Users } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import { avatarUrl } from "../../utils/avatar";
import ConnectionListShimmering from "../shimmering/ConnectionListShimmering";
import { ProfileEmptyAction, ProfileEmptyState, ProfileSectionHeading } from "../profile/ProfileSection";

export default function ProfileConnections() {
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useUserContext();

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const data = await connectionsApi.getMyConnections();
                setConnections(data.connections || []);
            } catch (err) {
                console.error("Error fetching connections:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    return (
        <section>
            <ProfileSectionHeading title="Connections" count={loading ? undefined : connections.length} />

            {loading ? (
                <ConnectionListShimmering />
            ) : connections.length === 0 ? (
                <ProfileEmptyState
                    icon={Users}
                    title="No connections yet"
                    hint="People you connect with will show up here."
                    action={<ProfileEmptyAction to="/search">Find people</ProfileEmptyAction>}
                />
            ) : (
                <div className="flex flex-col gap-2">
                    {connections.map((user) => (
                        <div
                            key={user.id}
                            className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-line-soft hover:bg-white/[0.04] hover:border-line cliq-transition"
                        >
                            {/* Left Section - Profile Info */}
                            <Link
                                to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`}
                                className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 rounded-xl no-underline focus-ring"
                            >
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-surface-600 border border-line group-hover:border-brand/30 cliq-transition shrink-0">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src={avatarUrl(user?.imageUrl)}
                                        alt={`${user.firstname} ${user.lastname}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-white truncate">
                                        {user.firstname} {user.lastname}
                                    </span>
                                    <span className="text-xs text-ink-300 truncate mt-0.5">
                                        @{user.firstname?.toLowerCase()}_{user.lastname?.toLowerCase()}
                                    </span>
                                </div>
                            </Link>

                            {/* Right Section - Action Buttons */}
                            <button
                                type="button"
                                onClick={() => navigate(`/messages/${user.id}`)}
                                aria-label={`Message ${user.firstname} ${user.lastname}`}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/[0.06] border border-line text-sm font-medium text-white hover:bg-white/[0.1] hover:border-line-strong cliq-press shrink-0 focus-ring"
                            >
                                <MessageSquare size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Message</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

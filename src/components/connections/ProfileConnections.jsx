import { useEffect, useState } from "react";
import * as connectionsApi from "../../api/connections";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useUserContext } from "../../context/UserContext";
import { avatarUrl } from "../../utils/avatar";
import ConnectionListShimmering from "../shimmering/ConnectionListShimmering";

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

    if (loading) return <ConnectionListShimmering />;

    if (connections.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-700">
                <p className="text-gray-400">You don't have any connections yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {connections.map((user) => (
                <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 group"
                >
                    {/* Left Section - Profile Info */}
                    <Link
                        to={currentUser?.id === user.id ? "/profile" : `/public-profile/${user.id}`}
                        className="flex items-center gap-4 min-w-0 flex-1"
                    >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 border-[2px] border-neutral-800 group-hover:border-neutral-700 transition-colors shrink-0">
                            <img
                                loading="lazy"
                                decoding="async"
                                src={avatarUrl(user?.imageUrl)}
                                alt={`${user.firstname} ${user.lastname}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[15px] text-white truncate">
                                {user.firstname} {user.lastname}
                            </span>
                            <span className="text-[13px] text-neutral-400 truncate mt-0.5">
                                @{user.firstname?.toLowerCase()}_{user.lastname?.toLowerCase()}
                            </span>
                        </div>
                    </Link>

                    {/* Right Section - Action Buttons */}
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => navigate(`/messages/${user.id}`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-full text-sm font-semibold transition-colors shrink-0 shadow-sm"
                        >
                            <MessageSquare size={16} className="fill-black/5" />
                            <span>Message</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}


import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import { User, MessageSquare } from "lucide-react";

export default function MyConnection() {
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await axiosClient.get("/myconnection");
                if (Array.isArray(res.data)) {
                    setConnections(res.data);
                } else if (res.data.connections && Array.isArray(res.data.connections)) {
                    setConnections(res.data.connections);
                } else {
                    setConnections([]);
                }
            } catch (err) {
                console.error("Error fetching connections:", err);
                setError("Failed to load connections.");
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);

    const avatar = (img) =>
        img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full relative px-2">

            <h2 className="text-xl font-bold text-black dark:text-white mb-6 px-1">
                My Connections
            </h2>

            {connections.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    You have no connections yet.
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {connections.map((conn) => {
                        // Check for 'toUser' as per user provided JSON, fallback to 'user' or 'conn' itself
                        const user = conn;

                        // Skip if user object is missing or doesn't have an ID
                        if (!user || (!user._id && !user.id)) return null;

                        return (
                            <div
                                key={user._id || user.id}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                            >
                                {/* Left Section - Profile Info */}
                                <Link to={`/user/${user._id || user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                                        <img
                                            src={avatar(user?.imageUrl)}
                                            alt={user?.firstname || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-sm text-black dark:text-white truncate">
                                            {user?.firstname} {user?.lastname}
                                        </span>
                                        <span className="text-sm text-neutral-500 truncate">
                                            {user?.username || user?.email?.split("@")[0] || "User"}
                                        </span>
                                    </div>
                                </Link>

                                {/* Right Section - Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/chat/${user._id || user.id}`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <MessageSquare size={16} />
                                        <span>Chat</span>
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

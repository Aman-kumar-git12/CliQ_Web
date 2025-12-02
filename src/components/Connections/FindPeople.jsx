import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import FindPeopleShimmering from "../shimmering/FindPeopleShimmering";

export default function FindPeople() {
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState(""); // SNACK MESSAGE STATE
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Show snackbar for 2 seconds
    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    // Fetch suggested users
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!search) setLoading(true); // Only show loader if not searching
            try {
                const res = await axiosClient.get("/user/search/suggested");
                setSuggestions(res.data);
            } catch (err) {
                console.error("Suggestion error:", err);
            } finally {
                if (!search) setLoading(false);
            }
        };
        fetchSuggestions();
    }, [refreshTrigger]);

    // Search handler
    useEffect(() => {
        const searchUsers = async () => {
            if (!search.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await axiosClient.get(`/user/search/${search}`);
                setResults(res.data);
            } catch (err) {
                console.error("Search error:", err);
            }
            setLoading(false);
        };

        const timer = setTimeout(searchUsers, 400);
        return () => clearTimeout(timer);
    }, [search]);



    const avatar = (img) =>
        img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    const [connectionStatuses, setConnectionStatuses] = useState({});

    // Fetch connection statuses for users in the list
    useEffect(() => {
        const usersToFetch = search ? results : suggestions;
        if (usersToFetch.length === 0) return;

        const fetchStatuses = async () => {
            const statuses = {};
            await Promise.all(usersToFetch.map(async (user) => {
                try {
                    const res = await axiosClient.get(`/user/connections/${user.id}`);
                    // Assuming API returns { status: "..." } or similar
                    const status = res.data.status || (res.data.connection && res.data.connection.status);
                    const senderId = res.data.sender || (res.data.connection && res.data.connection.sender);

                    if (status) {
                        statuses[user.id] = {
                            status: status === "accepted" ? "connected" : status,
                            sender: senderId
                        };
                    } else {
                        statuses[user.id] = { status: "none" };
                    }
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        statuses[user.id] = { status: "none" };
                    }
                }
            }));
            setConnectionStatuses(prev => ({ ...prev, ...statuses }));
        };

        fetchStatuses();
    }, [results, suggestions]);

    // 🔵 FOLLOW BUTTON HANDLER
    const handleFollow = async (userId) => {
        const currentData = connectionStatuses[userId] || { status: "none" };
        const currentStatus = currentData.status;

        if (currentStatus === "connected" || currentStatus === "interested") {
            return;
        }

        try {
            await axiosClient.post(`/request/send/interested/${userId}`);

            // Update local state
            setConnectionStatuses(prev => ({
                ...prev,
                [userId]: { status: "interested" }
            }));
            localStorage.setItem(`connection_status_${userId}`, "interested");

            showSnack("Request sent");

            // Trigger refresh in background
            setRefreshTrigger(!refreshTrigger);
        } catch (error) {
            console.error("Follow failed:", error);

            if (error.response && error.response.status === 409) {
                const existing = error.response.data.existing;
                if (existing) {
                    if (existing.status === "ignored") {
                        // If ignored, delete the connection and retry
                        try {
                            await axiosClient.delete(`/user/connections/cancel/${userId}`);
                            // Retry follow
                            await axiosClient.post(`/request/send/interested/${userId}`);

                            setConnectionStatuses(prev => ({
                                ...prev,
                                [userId]: { status: "interested" }
                            }));
                            localStorage.setItem(`connection_status_${userId}`, "interested");
                            showSnack("Request sent successfully");
                            setRefreshTrigger(!refreshTrigger);
                        } catch (retryError) {
                            console.error("Retry follow failed:", retryError);
                            showSnack("Failed to send request");
                        }
                    } else if (existing.status === "interested") {
                        setConnectionStatuses(prev => ({
                            ...prev,
                            [userId]: { status: "interested" }
                        }));
                        showSnack("Request already sent");
                    } else if (existing.status === "accepted") {
                        setConnectionStatuses(prev => ({
                            ...prev,
                            [userId]: { status: "connected" }
                        }));
                        showSnack("You are already following this user");
                    }
                } else {
                    showSnack("Failed to send request");
                }
            } else {
                showSnack("Failed to send request");
            }
        }
    };

    const getButtonText = (userId) => {
        const status = connectionStatuses[userId]?.status;
        switch (status) {
            case "connected": return "Connected";
            case "interested": return "Requested";
            default: return "Follow";
        }
    };

    const getButtonStyle = (userId) => {
        const status = connectionStatuses[userId]?.status;
        if (status === "connected") return "bg-green-100 text-green-700 border-green-200 cursor-default";
        if (status === "interested") return "bg-neutral-100 text-neutral-500 border-neutral-200 cursor-default";
        return "bg-black dark:bg-white text-white dark:text-black hover:opacity-80";
    };

    return (
        <div className="w-full relative">

            {/* Search */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-3 text-neutral-400">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border-none 
                               text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition"
                />
            </div>

            {/* Section Heading */}
            <h2 className="text-sm font-semibold text-neutral-500 mb-4 px-1">
                {search ? "Search Results" : "Suggested for you"}
            </h2>

            {/* Loader */}
            {loading && <FindPeopleShimmering />}

            {/* User List */}
            <div className="flex flex-col gap-1">
                {(search ? results : suggestions).map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                        {/* Left Section */}
                        <Link to={`/user/${user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                                <img
                                    src={avatar(user.imageUrl)}
                                    alt="user"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm text-black dark:text-white truncate">
                                    {user.firstname} {user.lastname}
                                </span>
                                <span className="text-sm text-neutral-500 truncate">
                                    {user.username || user.email.split("@")[0]}
                                </span>
                            </div>
                        </Link>

                        {/* FOLLOW BUTTON */}
                        <button
                            onClick={() => handleFollow(user.id)}
                            disabled={connectionStatuses[user.id]?.status === "connected" || connectionStatuses[user.id]?.status === "interested"}
                            className={`px-4 sm:px-6 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 
                                       text-sm font-semibold transition-all duration-200
                                       ${getButtonStyle(user.id)}`}
                        >
                            {getButtonText(user.id)}
                        </button>
                    </div>
                ))
                }

                {/* No results */}
                {
                    !loading && (
                        (search && results.length === 0) ? (
                            <p className="text-neutral-500 text-center py-8 text-sm">
                                No users found.
                            </p>
                        ) : (!search && suggestions.length === 0) ? (
                            <p className="text-neutral-500 text-center py-8 text-sm">
                                No suggestions available.
                            </p>
                        ) : null
                    )
                }
            </div >

            {/* SNACKBAR */}
            {
                snack && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1 z-[100]
                                px-6 py-3 bg-black/90 text-white text-sm font-medium
                                rounded-full shadow-2xl animate-fadeIn pointer-events-none whitespace-nowrap">
                        {snack}
                    </div>
                )
            }
        </div >
    );
}

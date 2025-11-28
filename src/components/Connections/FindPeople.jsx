import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Search } from "lucide-react";

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
            try {
                const res = await axiosClient.get("/user/search/suggested");
                setSuggestions(res.data);
            } catch (err) {
                console.error("Suggestion error:", err);
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

    // 🔵 FOLLOW BUTTON HANDLER
    const handleFollow = async (userId) => {
        // Optimistic Update: Remove user immediately
        if (search) {
            setResults((prev) => prev.filter((u) => u.id !== userId));
        } else {
            setSuggestions((prev) => prev.filter((u) => u.id !== userId));
        }

        try {
            await axiosClient.post(`/request/send/interested/${userId}`);
            showSnack("Follow request sent");
            // Trigger refresh in background to ensure sync, but UI is already updated
            setRefreshTrigger(!refreshTrigger);
        } catch (error) {
            console.error("Follow failed:", error);
            showSnack("Failed to send request");
            // Revert optimistic update if needed (optional, but keeping simple for now)
            setRefreshTrigger(!refreshTrigger); // Refresh to get correct state back
        }
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
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white"></div>
                </div>
            )}

            {/* User List */}
            <div className="flex flex-col gap-1">
                {(search ? results : suggestions).map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                    >
                        {/* Left Section */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
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
                        </div>

                        {/* FOLLOW BUTTON */}
                        <button
                            onClick={() => handleFollow(user.id)}
                            className="px-4 sm:px-6 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 
                                       text-sm font-semibold bg-white dark:bg-neutral-900 
                                       hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-black dark:text-white"
                        >
                            Follow
                        </button>
                    </div>
                ))}

                {/* No results */}
                {search && results.length === 0 && !loading && (
                    <p className="text-neutral-500 text-center py-8 text-sm">
                        No users found.
                    </p>
                )}
            </div>

            {/* SNACKBAR */}
            {snack && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1 z-[100]
                                px-6 py-3 bg-black/90 text-white text-sm font-medium
                                rounded-full shadow-2xl animate-fadeIn pointer-events-none whitespace-nowrap">
                    {snack}
                </div>
            )}
        </div>
    );
}

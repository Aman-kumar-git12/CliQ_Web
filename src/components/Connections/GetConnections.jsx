import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { X, Check } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useAnimation, animate, AnimatePresence } from "framer-motion";
import MyExperties from "../MyExperties/MyExperties";

export default function GetConnections() {
    const [user, setUser] = useState(null);
    const [nextUser, setNextUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showExpertise, setShowExpertise] = useState(false);

    const x = useMotionValue(0);
    const dragX = useMotionValue(0);

    const rotate = useTransform(dragX, [-300, 300], [-45, 45]);

    const bg = useTransform(
        dragX,
        [-300, 0, 300],
        ["rgb(254, 202, 202)", "rgb(255, 255, 255)", "rgb(167, 243, 208)"]
    );

    const transformOrigin = useTransform(dragX, (x) =>
        x >= 0 ? "bottom right" : "bottom left"
    );

    const likeOpacity = useTransform(dragX, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(dragX, [-150, -50], [1, 0]);

    const controls = useAnimation();

    const SWIPE_THRESHOLD = 200;

    const avatar = (img) =>
        img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    const fetchNextUser = async () => {
        try {
            const res = await axiosClient.get("/request/user");
            return res.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                return null;
            }
            console.error("Error fetching next user:", err);
            return null;
        }
    };

    // Helper to fetch a user distinct from the current one
    const fetchDistinctUser = async (excludeInfo) => {
        let attempts = 0;
        let candidate = null;

        while (attempts < 5) { // Try 5 times to get a different user
            candidate = await fetchNextUser();
            if (!candidate) break; // Network error or no users

            // If we have an exclusion and it matches, retry
            if (excludeInfo && candidate.id === excludeInfo.id) {
                attempts++;
                continue;
            }

            return candidate; // Found a good one
        }
        return null; // Could not find a distinct user
    };

    const initializeUsers = async () => {
        setLoading(true);
        const firstUser = await fetchNextUser();
        setUser(firstUser);

        if (firstUser) {
            // Buffer the next user, ensuring it's not the same as the first
            const secondUser = await fetchDistinctUser(firstUser);
            setNextUser(secondUser);
        }
        setLoading(false);
    };

    const advanceToNextUser = async () => {
        setShowExpertise(false);
        controls.set({ x: 0, opacity: 1, y: 100, scale: 0.8 });
        dragX.set(0);

        if (nextUser) {
            const currentUser = nextUser; // The one we are about to show
            setUser(currentUser);
            setNextUser(null);

            // Refill buffer in background, excluding the user we just showed
            const newNext = await fetchDistinctUser(currentUser);
            setNextUser(newNext);
        } else {
            // Fallback - heavy load (no loading spinner to avoid flash)
            const newUser = await fetchNextUser();
            setUser(newUser);

            if (newUser) {
                const second = await fetchDistinctUser(newUser);
                setNextUser(second);
            }
        }
    };

    useEffect(() => {
        initializeUsers();
    }, []);

    const [snack, setSnack] = useState("");

    const showSnack = (msg) => {
        setSnack(msg);
        setTimeout(() => setSnack(""), 2000);
    };

    const handleIgnore = async () => {
        if (!user || sending) return;
        setSending(true);

        await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });

        try {
            await axiosClient.post(`/request/send/ignored/${user.id}`);
            showSnack("Ignored user");

            await advanceToNextUser();
        } catch (err) {
            console.error("Failed to ignore:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
        }
    };

    const handleInterested = async () => {
        if (!user || sending) return;
        setSending(true);

        try {
            // Check if connection already exists
            let shouldDeleteIgnored = false;
            try {
                const res = await axiosClient.get(`/user/connections/${user.id}`);
                const status = res.data.status || (res.data.connection && res.data.connection.status);

                if (status === "ignored") {
                    shouldDeleteIgnored = true;
                } else if (status && status !== "none") {
                    showSnack("Connection already exists");
                    setSending(false);
                    return;
                }
            } catch (error) {
                // If 404 or error, connection likely doesn't exist, proceed
                if (error.response && error.response.status !== 404) {
                    console.error("Error checking connection:", error);
                }
            }

            if (shouldDeleteIgnored) {
                try {
                    await axiosClient.delete(`/user/connections/cancel/${user.id}`);
                } catch (delErr) {
                    console.error("Failed to delete ignored connection:", delErr);
                }
            }

            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });

            await axiosClient.post(`/request/send/interested/${user.id}`);
            localStorage.setItem(`connection_status_${user.id}`, "interested");
            showSnack("Request sent successfully");

            await advanceToNextUser();
        } catch (err) {
            console.error("Failed to send interest:", err);
            showSnack("Failed to send request");
            // Reset animation if failed
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
        }
    };

    const handleDragEnd = async (_, info) => {
        const swipe = info.offset.x;
        const velocity = info.velocity.x;

        if (swipe > SWIPE_THRESHOLD || velocity > 800) {
            handleInterested();
            return;
        }

        if (swipe < -SWIPE_THRESHOLD || velocity < -800) {
            handleIgnore();
            return;
        }

        animate(dragX, 0, { type: "spring", stiffness: 300, damping: 20 });
    };

    return (
        <motion.div
            style={{ backgroundColor: bg }}
            className="
                grid place-items-center
                pt-8 pb-8
                px-4
                overflow-hidden
                min-h-[500px]
                rounded-3xl
                transition-colors duration-200
                relative
                w-full
            "
        >
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
                </div>
            )}

            {/* No User State */}
            {!loading && !user && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 z-10 col-start-1 row-start-1">
                    <p>No more suggestions available.</p>
                    <button
                        onClick={initializeUsers}
                        className="mt-4 text-blue-500 hover:underline"
                    >
                        Refresh
                    </button>
                </div>
            )}

            {/* User Card */}
            <AnimatePresence>
                {!loading && user && (
                    <motion.div
                        key={user.id}
                        drag="x"
                        onDrag={(e, info) => dragX.set(info.offset.x)}
                        onDragEnd={handleDragEnd}
                        whileTap={{ scale: 0.98 }}
                        variants={{
                            hidden: { scale: 0.8, opacity: 0, y: 100, x: 0 },
                            visible: {
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                x: 0,
                                rotate: 0,
                                transition: { type: "spring", stiffness: 260, damping: 20 }
                            },
                            exitLeft: { x: -500, opacity: 0, transition: { duration: 0.3 } },
                            exitRight: { x: 500, opacity: 0, transition: { duration: 0.3 } }
                        }}
                        initial="hidden"
                        animate={sending ? controls : "visible"}
                        style={{ x: dragX, rotate, transformOrigin, touchAction: "none" }}
                        className="
                            w-full
                            max-w-[22rem] sm:max-w-sm
                            bg-white dark:bg-neutral-900
                            border border-neutral-200 dark:border-neutral-800
                            shadow-2xl
                            rounded-[3rem]
                            p-6
                            flex flex-col items-center
                            relative
                            cursor-grab active:cursor-grabbing
                            select-none overflow-hidden
                            col-start-1 row-start-1
                        "
                    >
                        {/* Visual Indicators (Stamps) */}
                        <motion.div
                            style={{ opacity: likeOpacity }}
                            className="absolute top-10 left-10 z-50 pointer-events-none"
                        >
                            <div className="border-4 border-emerald-500 rounded-lg px-4 py-1 -rotate-12">
                                <span className="text-3xl font-black text-emerald-500 tracking-tighter uppercase">LIKE</span>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{ opacity: nopeOpacity }}
                            className="absolute top-10 right-10 z-50 pointer-events-none"
                        >
                            <div className="border-4 border-red-500 rounded-lg px-4 py-1 rotate-12">
                                <span className="text-3xl font-black text-red-500 tracking-tighter uppercase">NOPE</span>
                            </div>
                        </motion.div>


                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neutral-100 to-transparent dark:from-neutral-800/50 pointer-events-none"></div>

                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white dark:border-neutral-800 z-10 mb-4 pointer-events-none">
                            <img src={avatar(user.imageUrl)} className="w-full h-full object-cover" />
                        </div>

                        <h2 className="text-center text-2xl font-bold text-black dark:text-white pointer-events-none">
                            {user.firstname} {user.lastname}
                        </h2>

                        <p className="text-center text-neutral-500 text-lg mt-1 mb-4 pointer-events-none">
                            {user.age ? `${user.age} years old` : "New User"}
                        </p>

                        <button
                            onClick={() => setShowExpertise(true)}
                            className="px-6 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm mb-8 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors pointer-events-auto"
                        >
                            View Expertise
                        </button>

                        <div
                            className="flex items-center gap-6 w-full justify-center"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleIgnore}
                                disabled={sending}
                                className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110 disabled:opacity-50"
                            >
                                <X size={28} />
                            </button>

                            <button
                                onClick={handleInterested}
                                disabled={sending}
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                            >
                                <Check size={32} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXPERTISE MODAL */}
            <AnimatePresence>
                {showExpertise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
                        >
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900 z-10">
                                <h3 className="text-lg font-bold text-black dark:text-white">User Expertise</h3>
                                <button
                                    onClick={() => setShowExpertise(false)}
                                    className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    <X size={20} className="text-black dark:text-white" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0">
                                <MyExperties expertise={user?.expertise} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SNACKBAR */}
            <AnimatePresence>
                {snack && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 translate-x-1 z-[100]
                                    px-6 py-3 bg-black/90 text-white text-sm font-medium
                                    rounded-full shadow-2xl pointer-events-none whitespace-nowrap"
                    >
                        {snack}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

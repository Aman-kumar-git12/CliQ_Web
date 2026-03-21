import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { X, Check, ShieldCheck } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useAnimation, animate, AnimatePresence, useSpring } from "framer-motion";
import MyExperties from "../MyExperties/MyExperties";

export default function GetConnections() {
    const [user, setUser] = useState(null);
    const [nextUser, setNextUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showExpertise, setShowExpertise] = useState(false);

    const x = useMotionValue(0);
    const dragX = useMotionValue(0);
    
    // Parallax Tilt Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
    const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
    const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

    const rotate = useTransform(dragX, [-300, 300], [-45, 45]);

    const bg = useTransform(
        dragX,
        [-300, 0, 300],
        ["#fecaca", "#ffffff", "#a7f3d0"] // Soft red, white, soft green
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
        mouseX.set(0);
        mouseY.set(0);

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

    const handleMouseMove = (e) => {
        if (sending) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

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
                    <div 
                        className="relative w-full max-w-[24rem] sm:max-w-md perspective-1000 z-20 group"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Outer Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-glow-pulse" />

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
                            }}
                            initial="hidden"
                            animate={sending ? controls : "visible"}
                            style={{ 
                                x: dragX, 
                                rotate, 
                                rotateX: springRotateX, 
                                rotateY: springRotateY,
                                transformOrigin, 
                                touchAction: "none" 
                            }}
                            className="
                                w-full
                                bg-white/60 dark:bg-black/60
                                backdrop-blur-3xl
                                border border-white/40 dark:border-white/20
                                shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
                                rounded-[34px]
                                relative
                                cursor-grab active:cursor-grabbing
                                select-none overflow-hidden
                                flex flex-col
                                transition-shadow duration-500
                                group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]
                            "
                        >
                        {/* Animated Mesh Gradient Header */}
                        <div className="absolute top-0 left-0 w-full h-44 overflow-hidden pointer-events-none opacity-50">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-transparent animate-mesh" />
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)] animate-mesh" style={{ animationDelay: '-5s' }} />
                        </div>
                        
                        {/* Aesthetic Floating Background Words */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
                            <motion.span 
                                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[20%] left-[-10%] text-4xl font-black tracking-tighter text-neutral-400 dark:text-white uppercase rotate-[-15deg]"
                            >
                                Network
                            </motion.span>
                            <motion.span 
                                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-[30%] right-[-5%] text-5xl font-black tracking-tighter text-neutral-400 dark:text-white uppercase rotate-[10deg]"
                            >
                                Growth
                            </motion.span>
                            <motion.span 
                                animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute top-[50%] left-[5%] text-2xl font-black tracking-widest text-neutral-400 dark:text-white uppercase opacity-50"
                            >
                                Explore
                            </motion.span>
                            <motion.span 
                                animate={{ rotate: [5, -5, 5] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-[5%] left-[20%] text-3xl font-black text-neutral-400 dark:text-white uppercase tracking-tighter opacity-30"
                            >
                                Connect
                            </motion.span>
                        </div>

                        {/* Visual Indicators (Stamps) */}
                        <motion.div
                            style={{ opacity: likeOpacity }}
                            className="absolute top-8 left-8 z-50 pointer-events-none"
                        >
                            <div className="bg-emerald-500 text-white rounded-2xl px-6 py-2 shadow-lg shadow-emerald-500/30 -rotate-12 border-2 border-white/20">
                                <span className="text-2xl font-black tracking-tight uppercase">LIKE</span>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{ opacity: nopeOpacity }}
                            className="absolute top-8 right-8 z-50 pointer-events-none"
                        >
                            <div className="bg-red-500 text-white rounded-2xl px-6 py-2 shadow-lg shadow-red-500/30 rotate-12 border-2 border-white/20">
                                <span className="text-2xl font-black tracking-tight uppercase">NOPE</span>
                            </div>
                        </motion.div>

                        {/* Card Content */}
                        <div className="relative z-10 p-8 flex flex-col h-full">
                            {/* Header Section */}
                                <div className="flex flex-col items-center mb-6">
                                    <motion.div 
                                        className="relative p-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl mb-4 group-hover:shadow-blue-500/20 transition-shadow duration-500"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-white/20 relative">
                                            <img 
                                                src={avatar(user.imageUrl)} 
                                                className="w-full h-full object-cover" 
                                                draggable="false"
                                            />
                                            {/* Online Indicator */}
                                            <div className="absolute bottom-1 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-black rounded-full" />
                                        </div>
                                    </motion.div>
                                    
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight drop-shadow-sm">
                                                {user.firstname} {user.lastname}
                                            </h2>
                                            <ShieldCheck size={24} className="text-blue-500 fill-blue-500/10" />
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <span className="text-lg text-neutral-700 dark:text-neutral-300 font-bold">
                                                {user.age ? `${user.age}` : "New"}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 uppercase tracking-[0.2em] font-black">Years Old</span>
                                        </div>
                                    </div>
                                </div>

                            {/* Skills Section */}
                            {user.expertise?.skills && user.expertise.skills.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap justify-center gap-2">
                                            {user.expertise.skills.slice(0, 4).map((skill, i) => (
                                                <span 
                                                    key={skill + i} 
                                                    className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-md text-[10px] font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-widest border border-black/5 dark:border-white/10 shadow-sm transition-all hover:bg-white/20 hover:scale-105"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Bio/About Section */}
                            <div className="flex-grow text-center mb-10">
                                <div className="inline-block relative">
                                    <p className="text-[15px] font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed line-clamp-3 italic px-4 drop-shadow-sm">
                                        "{user.expertise?.aboutYou || user.expertise?.description || "Looking for great connections and opportunities. Let's build something amazing together!"}"
                                    </p>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="mt-auto space-y-6">
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowExpertise(true)}
                                        className="group relative px-8 py-3 rounded-full overflow-hidden transition-all active:scale-95 shadow-lg border border-white/20"
                                    >
                                        <div className="absolute inset-0 bg-neutral-900 dark:bg-white group-hover:bg-black dark:group-hover:bg-neutral-200 transition-colors" />
                                        <span className="relative z-10 text-[11px] font-black text-white dark:text-black uppercase tracking-[0.2em]">
                                            View Full Expertise
                                        </span>
                                    </button>
                                </div>

                                <div
                                    className="flex items-center gap-8 w-full justify-center"
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={handleIgnore}
                                        disabled={sending}
                                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 disabled:opacity-50"
                                    >
                                        <X size={30} strokeWidth={2.5} />
                                    </button>

                                    <button
                                        onClick={handleInterested}
                                        disabled={sending}
                                        className="w-20 h-20 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:shadow-blue-500/30 disabled:opacity-50 relative group"
                                    >
                                        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity animate-pulse" />
                                        <Check size={40} strokeWidth={3} className="relative z-10" />
                                    </button>
                                </div>
                            </div>
                        </div>

                            {/* Bottom Decoration */}
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
                        </motion.div>
                    </div>
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

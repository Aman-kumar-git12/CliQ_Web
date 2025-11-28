import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { X, Check } from "lucide-react";
import { motion, useMotionValue, useTransform, useAnimation, animate } from "framer-motion";

export default function GetConnections() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const x = useMotionValue(0);
    const dragX = useMotionValue(0);

    const rotate = useTransform(dragX, [-300, 300], [-25, 25]);

    const bg = useTransform(
        dragX,
        [-300, 0, 300],
        ["rgb(254, 202, 202)", "rgb(255, 255, 255)", "rgb(167, 243, 208)"]
    );

    const transformOrigin = useTransform(dragX, (x) =>
        x >= 0 ? "bottom right" : "bottom left"
    );

    const controls = useAnimation();

    const SWIPE_THRESHOLD = 175;

    const avatar = (img) =>
        img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    const fetchRandomUser = async () => {
        setLoading(true);
        controls.set({ x: 0, opacity: 1 });
        dragX.set(0);

        try {
            const res = await axiosClient.get("/request/user");
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching random user:", err);
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRandomUser();
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
        } catch (err) {
            console.error("Failed to ignore:", err);
        }

        setSending(false);
        fetchRandomUser();
    };

    const handleInterested = async () => {
        if (!user || sending) return;
        setSending(true);

        await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });

        try {
            await axiosClient.post(`/request/send/interested/${user.id}`);
            showSnack("Request sent successfully");
        } catch (err) {
            console.error("Failed to send interest:", err);
        }

        setSending(false);
        fetchRandomUser();
    };

    const handlePan = (_, info) => {
        dragX.set(info.offset.x);
    };

    const handlePanEnd = async (_, info) => {
        const swipe = info.offset.x;

        if (swipe > SWIPE_THRESHOLD) {
            handleInterested();
            return;
        }

        if (swipe < -SWIPE_THRESHOLD) {
            handleIgnore();
            return;
        }

        animate(dragX, 0, { type: "spring", stiffness: 300, damping: 20 });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <p>No more suggestions available.</p>
                <button
                    onClick={fetchRandomUser}
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <motion.div
            style={{ backgroundColor: bg }}
            className="
                flex justify-center items-center
                pt-8 pb-8
                px-4
                overflow-hidden
                min-h-[500px]
                rounded-3xl
                transition-colors duration-200
                relative
            "
        >

            <motion.div
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                whileTap={{ scale: 0.98 }}
                style={{ x, rotate, transformOrigin, touchAction: "none" }}
                animate={controls}
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
                "
            >
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

                <button className="px-6 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm mb-8 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors pointer-events-auto">
                    My Expertise
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

            {/* SNACKBAR */}
            {snack && (
                <div className="fixed bottom-20  translate-x-1 z-[100]
                                px-6 py-3 bg-black/90 text-white text-sm font-medium
                                rounded-full shadow-2xl animate-fadeIn pointer-events-none whitespace-nowrap">
                    {snack}
                </div>
            )}
        </motion.div>
    );
}

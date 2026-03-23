import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { X, Check, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useAnimation, animate, AnimatePresence, useSpring } from "framer-motion";
import MyExperties from "../MyExperties/MyExperties";
import MatchCardShimmering from "../shimmering/MatchCardShimmering";

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
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 35 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 35 });

    const rotate = useTransform(dragX, [-300, 300], [-35, 35]);

    const bgGlow = useTransform(
        dragX,
        [-150, 0, 150],
        ["rgba(239, 68, 68, 0.08)", "rgba(255, 255, 255, 0)", "rgba(34, 197, 94, 0.08)"]
    );

    const transformOrigin = useTransform(dragX, (x) =>
        x >= 0 ? "bottom right" : "bottom left"
    );

    const likeScale = useTransform(dragX, [0, 150], [0.8, 1.2]);
    const nopeScale = useTransform(dragX, [-150, 0], [1.2, 0.8]);

    // Stamp opacities — MUST be top-level hooks, NOT inside JSX
    const likeOpacity = useTransform(dragX, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(dragX, [-150, -50], [1, 0]);

    const controls = useAnimation();
    const SWIPE_THRESHOLD = 180;

    const avatar = (img) => img || "https://cdn-icons-png.flaticon.com/512/219/219969.png";

    const fetchNextUser = async () => {
        try {
            const res = await axiosClient.get("/request/user");
            return res.data;
        } catch (err) {
            console.error("Error fetching next user:", err);
            return null;
        }
    };

    const fetchDistinctUser = async (excludeInfo) => {
        let attempts = 0;
        let candidate = null;
        while (attempts < 3) {
            candidate = await fetchNextUser();
            if (!candidate || !excludeInfo || candidate.id !== excludeInfo.id) return candidate;
            attempts++;
        }
        return null;
    };

    const initializeUsers = async () => {
        setLoading(true);
        const firstUser = await fetchNextUser();
        setUser(firstUser);
        if (firstUser) {
            const secondUser = await fetchDistinctUser(firstUser);
            setNextUser(secondUser);
        }
        setLoading(false);
    };

    const advanceToNextUser = async () => {
        setShowExpertise(false);
        controls.set({ x: 0, opacity: 1, scale: 0.9, y: 50 });
        dragX.set(0);
        mouseX.set(0);
        mouseY.set(0);

        if (nextUser) {
            const currentUser = nextUser;
            setUser(currentUser);
            setNextUser(null);
            const newNext = await fetchDistinctUser(currentUser);
            setNextUser(newNext);
        } else {
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
        await controls.start({ x: -600, opacity: 0, transition: { duration: 0.4, ease: "anticipate" } });
        try {
            await axiosClient.post(`/request/send/ignored/${user.id}`);
            showSnack("Ignored");
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
            await controls.start({ x: 600, opacity: 0, transition: { duration: 0.4, ease: "anticipate" } });
            await axiosClient.post(`/request/send/interested/${user.id}`);
            showSnack("Request Sent");
            await advanceToNextUser();
        } catch (err) {
            console.error("Failed to send interest:", err);
            controls.set({ x: 0, opacity: 1, scale: 1, y: 0 });
        } finally {
            setSending(false);
        }
    };

    const handleDragEnd = async (_, info) => {
        const swipe = info.offset.x;
        const velocity = info.velocity.x;
        if (swipe > SWIPE_THRESHOLD || velocity > 500) {
            handleInterested();
        } else if (swipe < -SWIPE_THRESHOLD || velocity < -500) {
            handleIgnore();
        } else {
            animate(dragX, 0, { type: "spring", stiffness: 400, damping: 25 });
        }
    };

    if (loading) return <div className="grid place-items-center py-20"><MatchCardShimmering /></div>;

    return (
        <motion.div
            style={{ backgroundColor: bgGlow }}
            className="w-full relative min-h-[700px] grid place-items-center pt-8 pb-12 px-4 overflow-hidden rounded-[40px] transition-colors duration-500 bg-[#16161f]"
        >
            <AnimatePresence>
                {!user ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-neutral-500 text-center">
                        <Sparkles size={48} className="mb-4 text-neutral-700" />
                        <p className="text-xl font-black uppercase tracking-widest italic">All connections evaluated.</p>
                        <button onClick={initializeUsers} className="mt-6 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all shadow-xl">Re-Init Range</button>
                    </motion.div>
                ) : (
                    <div className="relative w-full max-w-[24rem] sm:max-w-md z-20 group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                        {/* Dynamic Background Words */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 transition-opacity group-hover:opacity-10">
                            <span className="absolute top-[20%] left-[-10%] text-6xl font-black text-white italic -rotate-12">DISCOVERY</span>
                            <span className="absolute bottom-[20%] right-[-10%] text-6xl font-black text-white italic rotate-12">NETWORK</span>
                        </div>

                        <motion.div
                            key={user.id}
                            drag="x"
                            onDragEnd={handleDragEnd}
                            whileTap={{ scale: 0.98 }}
                            animate={sending ? controls : { scale: 1, opacity: 1, y: 0, x: 0 }}
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            style={{ x: dragX, rotate, rotateX: springRotateX, rotateY: springRotateY, transformOrigin, touchAction: "none" }}
                            className="w-full relative rounded-[32px] overflow-hidden flex flex-col cursor-grab active:cursor-grabbing h-[520px] border border-white/[0.07] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)]"
                        >
                            {/* Pure dark glassmorphism background */}
                            <div className="absolute inset-0 bg-[#0d0d0f] z-0" />
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-transparent to-violet-950/30 z-0" />

                            {/* Ambient top glow */}
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none z-0" />

                            {/* Swipe Stamps */}
                            <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-5 z-50 -rotate-12 bg-emerald-500 shadow-[0_0_24px_rgba(34,197,94,0.6)] text-white px-5 py-1.5 rounded-xl font-black text-sm tracking-[0.1em] uppercase border border-emerald-400/30 pointer-events-none">LIKE</motion.div>
                            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-6 right-5 z-50 rotate-12 bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.6)] text-white px-5 py-1.5 rounded-xl font-black text-sm tracking-[0.1em] uppercase border border-red-400/30 pointer-events-none">NOPE</motion.div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center h-full pt-10 px-7 pb-7">

                                {/* Large nbulela glow avatar */}
                                <div className="relative mb-6 shrink-0">
                                    {/* Nebula rings */}
                                    <div className="absolute inset-[-12px] rounded-full bg-gradient-to-tr from-cyan-500/30 via-violet-500/40 to-pink-500/30 blur-[18px] animate-pulse" />
                                    <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tl from-blue-400/20 via-purple-500/30 to-fuchsia-400/20 blur-[10px]" />

                                    {/* Avatar ring */}
                                    <div className="w-32 h-32 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.4)] relative z-10">
                                        <div className="w-full h-full rounded-full bg-[#0d0d0f] p-[2px]">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                <img src={avatar(user.imageUrl)} alt="user" className="w-full h-full object-cover" draggable="false" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Online dot */}
                                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-[3px] border-[#0d0d0f] rounded-full z-20 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                </div>

                                {/* Name — editorial large */}
                                <div className="text-center mb-1">
                                    <h2 className="text-[28px] font-black text-white tracking-[0.05em] uppercase leading-none" style={{ fontVariant: 'small-caps' }}>
                                        {user.firstname} {user.lastname}
                                    </h2>
                                </div>

                                {/* Tags row */}
                                <div className="flex items-center gap-2 mb-5">
                                    {user.expertise?.skills?.[0] && (
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                                            {user.expertise.skills[0]}
                                        </span>
                                    )}
                                    {user.age && (
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80 bg-violet-500/10 border border-violet-400/20 px-2.5 py-0.5 rounded-full">
                                            {user.age} Yrs
                                        </span>
                                    )}
                                    <ShieldCheck size={16} className="text-blue-400 ml-0.5" />
                                </div>

                                {/* Bio */}
                                <div className="flex-1 flex items-center justify-center w-full px-3">
                                    <p className="text-[13px] text-neutral-400 leading-[1.65] italic text-center line-clamp-3">
                                        &ldquo;{user.expertise?.aboutYou || "Looking for meaningful connections and opportunities to grow together."}&rdquo;
                                    </p>
                                </div>

                                {/* Actions — single row */}
                                <div className="w-full mt-4 flex items-center justify-between gap-3" onPointerDown={(e) => e.stopPropagation()}>

                                    {/* NOPE — most highlighted */}
                                    <motion.button
                                        style={{ scale: nopeScale }}
                                        onClick={handleIgnore}
                                        disabled={sending}
                                        whileHover={{ scale: 1.12, boxShadow: "0 0 24px rgba(239,68,68,0.4)" }}
                                        whileTap={{ scale: 0.82 }}
                                        className="w-14 h-14 flex items-center justify-center rounded-full text-red-400 border border-red-500/40 bg-red-500/10 transition-all duration-200 disabled:opacity-40 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                                    >
                                        <X size={22} strokeWidth={2.5} />
                                    </motion.button>

                                    {/* View Intel — small pill, right-leaning */}
                                    <button
                                        onClick={() => setShowExpertise(true)}
                                        className="px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.3em] text-violet-400/80 hover:text-violet-200 transition-all duration-200 active:scale-95"
                                        style={{
                                            background: "rgba(139,92,246,0.08)",
                                            border: "1px solid rgba(139,92,246,0.25)",
                                        }}
                                    >
                                        View Intel
                                    </button>

                                    {/* LIKE */}
                                    <motion.button
                                        style={{ scale: likeScale }}
                                        onClick={handleInterested}
                                        disabled={sending}
                                        whileHover={{ scale: 1.12, boxShadow: "0 0 35px rgba(255,255,255,0.35)" }}
                                        whileTap={{ scale: 0.82 }}
                                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black shadow-[0_4px_25px_rgba(255,255,255,0.2)] disabled:opacity-40 cursor-pointer"
                                    >
                                        <Check size={22} strokeWidth={3} />
                                    </motion.button>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExpertise && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl max-h-[85vh] rounded-[40px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Full Identity Intel</h3>
                                <button onClick={() => setShowExpertise(false)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X size={20} className="text-white" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto"><MyExperties expertise={user?.expertise} /></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {snack && (
                    <motion.div initial={{ opacity: 0, y: 30, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 30, x: "-50%" }} className="fixed bottom-12 left-1/2 z-[100] px-10 py-5 bg-white text-black text-[10px] font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-3xl pointer-events-none border border-white/20">
                        {snack}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

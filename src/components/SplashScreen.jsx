import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Zap, Globe, Sparkles } from "lucide-react";

const loadingMessages = [
    { text: "Waking up the server...", icon: Zap },
    { text: "Connecting to people...", icon: Network },
    { text: "Curating your feed...", icon: Globe },
    { text: "Almost there...", icon: Sparkles },
];

export default function SplashScreen({ onFinish, isAppReady }) {
    const [isVisible, setIsVisible] = useState(true);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    // Create a stable set of particles so they don't jump around on re-renders
    const [particles] = useState(() =>
        Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }))
    );

    useEffect(() => {
        // Minimum display time of 3.5 seconds to show off the cool animations
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (minTimeElapsed && isAppReady) {
            setIsVisible(false);
        }
    }, [minTimeElapsed, isAppReady]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const letterVariants = {
        hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
    };

    const ActiveIcon = loadingMessages[messageIndex].icon;

    return (
        <AnimatePresence onExitComplete={onFinish}>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950 text-white overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    {/* Background Particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute bg-emerald-500/30 rounded-full blur-[1px]"
                            style={{
                                width: p.size,
                                height: p.size,
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                            }}
                            animate={{
                                y: ["0%", "-50%", "0%"],
                                opacity: [0.1, 0.6, 0.1],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: p.delay,
                            }}
                        />
                    ))}

                    {/* Central Glow */}
                    <motion.div
                        className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Animated Logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{
                                duration: 1.2,
                                type: "spring",
                                bounce: 0.5
                            }}
                            className="mb-8 relative"
                        >
                            {/* Outer rotating ring */}
                            <motion.div
                                className="absolute -inset-4 rounded-[2rem] border border-dashed border-emerald-500/30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.5)] relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    animate={{ y: ["100%", "-100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <span className="text-6xl font-black tracking-tighter text-white drop-shadow-lg z-10">C</span>
                            </div>
                        </motion.div>

                        {/* Staggered Text Reveal */}
                        <motion.h1
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-5xl font-bold tracking-tight flex space-x-1"
                        >
                            {["C", "l", "i", "Q"].map((letter, index) => (
                                <motion.span
                                    key={index}
                                    variants={letterVariants}
                                    className="bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </motion.h1>

                        {/* Sleek Loading Line */}
                        <div className="relative w-64 h-[2px] mt-10 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3.5, ease: "easeInOut" }}
                            />
                        </div>

                        {/* Dynamic Message */}
                        <div className="mt-6 h-8 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={messageIndex}
                                    initial={{ y: 10, opacity: 0, filter: "blur(4px)" }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ y: -10, opacity: 0, filter: "blur(4px)" }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center space-x-3 text-emerald-300"
                                >
                                    <ActiveIcon className="w-5 h-5 animate-pulse" />
                                    <span className="text-sm tracking-widest uppercase font-medium">
                                        {loadingMessages[messageIndex].text}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

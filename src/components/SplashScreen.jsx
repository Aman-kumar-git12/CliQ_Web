import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onFinish, isAppReady }) {
    const [isVisible, setIsVisible] = useState(true);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);

    useEffect(() => {
        // Minimum display time of 2 seconds
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only hide if BOTH minimum time has passed AND app is ready
        if (minTimeElapsed && isAppReady) {
            setIsVisible(false);
        }
    }, [minTimeElapsed, isAppReady]);


    return (
        <AnimatePresence onExitComplete={onFinish}>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        {/* Logo / Branding */}
                        <div className="w-24 h-24 mb-4 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <span className="text-4xl font-black tracking-tighter">C</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            CliQ
                        </h1>

                        {/* Loading Line */}
                        <div className="w-32 h-1 bg-neutral-800 rounded-full mt-6 overflow-hidden relative">
                            <motion.div
                                className="h-full w-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 absolute top-0 rounded-full"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{
                                    duration: 1,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

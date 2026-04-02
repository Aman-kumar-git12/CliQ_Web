import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, AlertCircle, X, Smile, Loader2 } from 'lucide-react';

const Toastbar = ({ message, onClose, duration = 3000, type = "info" }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        info: <Info size={16} className="text-violet-400" />,
        success: <CheckCircle2 size={16} className="text-emerald-400" />,
        error: <AlertCircle size={16} className="text-red-400" />,
        funny: <Smile size={16} className="text-yellow-400" />,
        loading: <Loader2 size={16} className="text-violet-400 animate-spin" />
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20, y: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 0 }}
                className="fixed bottom-28 right-20 sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-[200] flex items-center gap-3 px-4 py-3 bg-[#11111a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-auto max-w-[calc(100vw-6rem)] sm:max-w-[420px]"
            >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {icons[type] || icons.info}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-[12px] sm:text-[13px] font-black uppercase italic tracking-tighter text-[#ece8f8] truncate">
                        {message}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-all group shrink-0"
                >
                    <X size={14} className="text-[#6f6a86] group-hover:text-white transition-colors" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default Toastbar;

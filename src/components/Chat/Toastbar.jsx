import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const Toastbar = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for transition out
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-24 left-1/2 md:left-[54%] -translate-x-1/2 z-[150] flex items-center gap-3 px-5 py-3 bg-[#1c1c1e] text-white rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.2)] border border-emerald-500/40 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}>
            <span className="text-[14px] font-bold tracking-wide text-emerald-400">{message}</span>
            <button
                onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={14} className="text-white/50" />
            </button>
        </div>
    );
};

export default Toastbar;

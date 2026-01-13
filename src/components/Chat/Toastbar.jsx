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
        <div className={`fixed bottom-24 left-[54%] -translate-x-1/2 z-[150] flex items-center gap-3 px-4 py-3 bg-[#323232] text-white rounded-xl shadow-2xl border border-white/5 transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            <span className="text-[14px] font-medium tracking-wide">{message}</span>
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

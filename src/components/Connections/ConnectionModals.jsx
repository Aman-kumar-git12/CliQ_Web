import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import MyExperties from "../MyExperties/MyExperties";

export const ConnectionExpertiseModal = ({ user, onClose }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl max-h-[85vh] rounded-[40px] overflow-hidden shadow-3xl relative flex flex-col border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-900/50 backdrop-blur-md">
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Full Identity Intel</h3>
                        {user?.matchReasons?.length > 0 && (
                            <p className="text-[11px] text-cyan-200/70 mt-1">{user.matchReasons.join(" • ")}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X size={20} className="text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto"><MyExperties expertise={user?.expertise} /></div>
            </motion.div>
        </motion.div>
    );
};

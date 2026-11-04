import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import ExpertiseView from "../expertise/ExpertiseView";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { backdropMotion, dialogMotion } from "../common/motionPresets";

export const ConnectionExpertiseModal = ({ user, onClose }) => {
    useEscapeKey(true, onClose);
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            {...backdropMotion}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
            <motion.div
                {...dialogMotion(reduceMotion)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="connection-expertise-title"
                className="bg-surface-raised w-full max-w-4xl max-h-[85vh] rounded-[32px] overflow-hidden shadow-pop relative flex flex-col border border-line-strong"
            >
                <div className="p-6 border-b border-line-soft flex justify-between items-center bg-surface-raised/80 backdrop-blur-md">
                    <div>
                        <h3
                            id="connection-expertise-title"
                            className="text-xl font-black uppercase italic tracking-tighter text-white"
                        >
                            Full Identity Intel
                        </h3>
                        {user?.matchReasons?.length > 0 && (
                            <p className="text-[11px] text-brand-light/80 mt-1">{user.matchReasons.join(" • ")}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 cliq-transition focus-ring"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
                    <ExpertiseView expertise={user?.expertise} />
                </div>
            </motion.div>
        </motion.div>
    );
};

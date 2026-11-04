/** Full-screen expertise modal of the own profile page, portalled to document.body. */
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import ExpertiseView from "../expertise/ExpertiseView";
import { backdropMotion, dialogMotion } from "../common/motionPresets";

export default function ProfileExpertiseModal({ isOpen, expertise, onClose }) {
    const reduceMotion = useReducedMotion();
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        {...backdropMotion}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        {...dialogMotion(reduceMotion)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-expertise-modal-title"
                        className="bg-surface-raised/95 w-full md:max-w-5xl rounded-[32px] p-6 md:p-10 border border-line-strong relative shadow-pop overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2
                                id="profile-expertise-modal-title"
                                className="text-3xl font-black text-white italic tracking-tighter uppercase"
                            >
                                User Expertise
                            </h2>
                            <button
                                type="button"
                                aria-label="Close expertise"
                                onClick={onClose}
                                className="bg-white/5 hover:bg-white/10 p-3 rounded-full text-white/50 hover:text-white cliq-transition border border-line active:scale-95 focus-ring"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="max-h-[75vh] md:max-h-[85vh] overflow-y-auto overscroll-contain pr-4 custom-scrollbar relative z-10">
                            <ExpertiseView expertise={expertise} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

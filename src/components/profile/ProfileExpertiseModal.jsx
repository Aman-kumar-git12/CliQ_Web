/** Full-screen expertise modal of the own profile page, portalled to document.body. */
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ExpertiseView from "../expertise/ExpertiseView";

export default function ProfileExpertiseModal({ isOpen, expertise, onClose }) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-expertise-modal-title"
                        className="bg-black/90 w-full md:max-w-5xl rounded-[40px] p-6 md:p-10 border border-white/20 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
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
                                className="bg-white/5 p-3 rounded-full text-white/40 hover:text-white transition-all border border-white/10 active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="max-h-[75vh] md:max-h-[85vh] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                            <ExpertiseView expertise={expertise} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

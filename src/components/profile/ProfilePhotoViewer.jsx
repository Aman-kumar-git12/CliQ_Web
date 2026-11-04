/** Full-screen profile photo viewer, portalled to document.body. */
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { backdropMotion, dialogMotion } from "../common/motionPresets";

export default function ProfilePhotoViewer({ isOpen, user, onClose }) {
    const reduceMotion = useReducedMotion();
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        {...backdropMotion}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        {...dialogMotion(reduceMotion)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Profile photo"
                        className="relative z-10 max-w-full max-h-[90vh] flex flex-col items-center gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label="Close photo"
                            onClick={onClose}
                            className="absolute -top-12 right-0 rounded-full p-1 text-white/50 hover:text-white transition-colors duration-150 ease-soft focus-ring"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={user.imageUrl}
                            alt={[user.firstname, user.lastname].filter(Boolean).join(" ") || "Profile photo"}
                            className="max-w-full max-h-[85vh] rounded-2xl shadow-pop border border-line"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

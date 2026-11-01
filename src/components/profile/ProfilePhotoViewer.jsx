/** Full-screen profile photo viewer, portalled to document.body. */
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ProfilePhotoViewer({ isOpen, user, onClose }) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                            className="absolute -top-12 right-0 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={user.imageUrl}
                            alt={[user.firstname, user.lastname].filter(Boolean).join(" ") || "Profile photo"}
                            className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

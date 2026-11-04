import { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { motion, useReducedMotion } from "framer-motion";
import { backdropMotion, dialogMotion } from "../common/motionPresets";
import { FOCUS_RING, PRESS, SOFT_TRANSITION } from "./postUi";

const reportReasons = [
    "Spam",
    "Hate or Abuse",
    "Harassment",
    "Threats or Violence",
    "Sexual or Explicit",
    "Offensive Language",
    "Bullying",
    "Impersonation",
    "Other",
];

const ReportModal = ({ isOpen, onClose, onReport, isReporting }) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const reduceMotion = useReducedMotion();

    useBodyScrollLock(isOpen);

    useEscapeKey(isOpen, onClose);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalReason = selectedReason === "Other" ? otherReason : selectedReason;
        if (!finalReason) return;
        onReport(finalReason);
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <motion.div
                {...backdropMotion}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                {...dialogMotion(reduceMotion)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
                className="relative bg-surface-raised border border-line-strong w-full max-w-md rounded-2xl shadow-pop overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-line flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={20} />
                        <h2 id="report-modal-title" className="text-xl font-bold text-white">
                            Report Post
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className={`p-1 hover:bg-white/10 rounded-full text-ink-300 hover:text-white ${SOFT_TRANSITION} ${FOCUS_RING}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-ink-300 text-sm leading-relaxed mb-2">
                        Why are you reporting this post? Your report is anonymous.
                    </p>

                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {reportReasons.map((reason) => (
                            <label
                                key={reason}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer ${SOFT_TRANSITION} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-light/50 ${
                                    selectedReason === reason
                                        ? "bg-red-500/10 border-red-500/50 text-white"
                                        : "bg-white/5 border-line-soft text-ink-300 hover:bg-white/10 hover:text-ink-100"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="reportReason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ease-soft ${
                                        selectedReason === reason ? "border-red-500" : "border-ink-500"
                                    }`}
                                >
                                    {selectedReason === reason && (
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                    )}
                                </div>
                                <span className="font-medium">{reason}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "Other" && (
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            maxLength={500}
                            placeholder="Please explain the issue..."
                            aria-label="Describe the issue"
                            className="w-full bg-white/5 border border-line rounded-xl p-3 text-white placeholder:text-ink-400 focus:outline-none focus:border-red-500/50 transition-colors duration-150 ease-soft resize-none h-24"
                            autoFocus
                        />
                    )}

                    {/* Footer */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 ${SOFT_TRANSITION} ${PRESS} ${FOCUS_RING}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isReporting || !selectedReason || (selectedReason === "Other" && !otherReason.trim())
                            }
                            className={`flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${SOFT_TRANSITION} ${FOCUS_RING}`}
                        >
                            {isReporting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Reporting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ReportModal;

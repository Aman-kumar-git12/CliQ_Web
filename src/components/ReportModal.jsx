import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const reportReasons = [
    "Spam",
    "Hate or Abuse",
    "Harassment",
    "Threats or Violence",
    "Sexual or Explicit",
    "Offensive Language",
    "Bullying",
    "Impersonation",
    "Other"
];

const ReportModal = ({ isOpen, onClose, onReport, isReporting }) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalReason = selectedReason === "Other" ? otherReason : selectedReason;
        if (!finalReason) return;
        onReport(finalReason);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            ></div>

            <div className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle size={20} />
                        <h2 className="text-xl font-bold text-white">Report Post</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-gray-400 text-sm mb-2">Why are you reporting this post? Your report is anonymous.</p>

                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {reportReasons.map((reason) => (
                            <label
                                key={reason}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${selectedReason === reason
                                    ? 'bg-red-500/10 border-red-500/50 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="reportReason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedReason === reason ? 'border-red-500' : 'border-gray-600'
                                    }`}>
                                    {selectedReason === reason && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                                </div>
                                <span className="font-medium">{reason}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "Other" && (
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder="Please explain the issue..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none h-24"
                            autoFocus
                        />
                    )}

                    {/* Footer */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isReporting || !selectedReason || (selectedReason === "Other" && !otherReason.trim())}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isReporting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Reporting...
                                </>
                            ) : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;

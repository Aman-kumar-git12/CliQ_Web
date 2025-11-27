import React from 'react';

export default function Confirmation({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    confirmText = "Yes",
    cancelText = "Cancel",
    confirmColor = "bg-red-500 hover:bg-red-600"
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 w-80 text-center border border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    {title}
                </h2>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-white transition ${confirmColor}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

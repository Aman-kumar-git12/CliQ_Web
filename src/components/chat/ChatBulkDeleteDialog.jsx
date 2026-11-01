/** Chat page confirmation dialog for deleting the selected messages (for me / for everyone). */
const ChatBulkDeleteDialog = ({ selectedCount, canDeleteForEveryone, onDelete, onCancel }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-bulk-delete-title"
            className="bg-surface-850/95 w-full max-w-[320px] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 p-7 animate-in zoom-in-95 duration-300"
        >
            <h3 id="chat-bulk-delete-title" className="text-xl font-black text-center mb-2 italic uppercase">
                Delete Message?
            </h3>
            <p className="text-[13px] text-white/40 text-center mb-6 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">{selectedCount}</span> messages
                from your history?
            </p>
            <div className="flex flex-col gap-3">
                {canDeleteForEveryone && (
                    <button
                        onClick={() => onDelete("everyone")}
                        className="w-full py-3.5 bg-red-500/10 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500/20 rounded-2xl transition-all active:scale-95"
                    >
                        Delete for everyone
                    </button>
                )}
                <button
                    onClick={() => onDelete("me")}
                    className="w-full py-3.5 bg-white/[0.03] text-brand font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.08] rounded-2xl transition-all active:scale-95"
                >
                    Delete for me
                </button>
                <button
                    onClick={onCancel}
                    className="w-full py-3.5 text-white/30 font-black uppercase text-[11px] tracking-widest hover:bg-white/[0.05] rounded-2xl transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

export default ChatBulkDeleteDialog;

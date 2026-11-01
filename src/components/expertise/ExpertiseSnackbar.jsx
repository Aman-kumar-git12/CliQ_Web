/** Bottom success/error snackbar for the Expertise Studio page. */
import { Check, Info, X } from "lucide-react";

const ExpertiseSnackbar = ({ snackbar, onDismiss }) => (
    <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[20px] shadow-2xl text-white font-bold animate-slideUp z-[300] flex items-center gap-4 border-t-2 border-white/20 backdrop-blur-xl
          ${snackbar.type === "success" ? "bg-emerald-600/95 shadow-emerald-500/20" : "bg-rose-600/95 shadow-rose-500/20"}`}
    >
        <div className="p-1.5 bg-white/20 rounded-lg">
            {snackbar.type === "success" ? <Check size={16} /> : <Info size={16} />}
        </div>
        <span className="tracking-tight">{snackbar.message}</span>
        <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
            <X size={16} />
        </button>
    </div>
);

export default ExpertiseSnackbar;

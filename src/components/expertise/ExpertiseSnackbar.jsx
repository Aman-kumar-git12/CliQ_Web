/** Bottom success/error snackbar for the Expertise Studio page. */
import { Check, Info, X } from "lucide-react";

const ExpertiseSnackbar = ({ snackbar, onDismiss }) => (
    <div
        role="status"
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-[20px] shadow-xl text-white font-bold animate-fadeIn z-[300] flex items-center gap-4 border border-white/20 backdrop-blur-xl
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
            className="hover:bg-white/20 rounded-lg p-1 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
            <X size={16} />
        </button>
    </div>
);

export default ExpertiseSnackbar;

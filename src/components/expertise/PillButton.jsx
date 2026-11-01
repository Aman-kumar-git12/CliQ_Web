/** Toggleable pill button (indigo or amber) used for AI builder topic/skill picks. */
const PillButton = ({ label, active, onClick, color = "indigo" }) => {
    const activeClass =
        color === "indigo"
            ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.03]"
            : "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.03]";
    const inactiveClass = "border-slate-200 bg-white text-slate-600 hover:border-slate-300";

    return (
        <button
            onClick={onClick}
            className={`rounded-full border px-4 py-2 text-xs font-black tracking-tight transition-all ${active ? activeClass : inactiveClass}`}
        >
            {label}
        </button>
    );
};

export default PillButton;

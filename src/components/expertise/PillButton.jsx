/** Toggleable pill button (brand purple or amber) used for AI builder topic/skill picks. */
const PillButton = ({ label, active, onClick, color = "indigo" }) => {
    const activeClass =
        color === "indigo"
            ? "border-brand bg-brand text-white shadow-md shadow-brand/25"
            : "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25";
    const inactiveClass =
        "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={`rounded-full border px-4 py-2 text-xs font-black tracking-tight transition duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${active ? activeClass : inactiveClass}`}
        >
            {label}
        </button>
    );
};

export default PillButton;

// Desktop sidebar while the session is checked: logo, the three nav sections and the user card.
// `compact` is the 90px icon rail used on the Messages pages.
const SECTIONS = [6, 1, 3];

const SidebarShimmering = ({ compact = false }) => {
    return (
        <div
            className={`fixed left-0 top-0 h-screen hidden md:flex flex-col bg-gradient-to-b from-surface-sidebar via-surface-800 to-surface-850 border-r border-line z-sidebar shadow-rail overflow-hidden motion-safe:animate-pulse ${compact ? "w-[90px]" : "w-[260px]"}`}
        >
            <div className={`flex items-center h-[120px] shrink-0 ${compact ? "justify-center" : "px-10 gap-4"}`}>
                <div className="w-11 h-11 rounded-[16px] bg-brand/30 shrink-0"></div>
                {!compact && <div className="h-6 w-20 rounded-lg bg-white/10"></div>}
            </div>

            <div className="flex-1 pt-2 overflow-hidden">
                {SECTIONS.map((items, s) => (
                    <div key={s} className="flex flex-col w-full mb-8">
                        {!compact && <div className="h-2.5 w-14 bg-white/10 rounded-full mx-5 mb-4"></div>}
                        <div className={`flex flex-col gap-1.5 ${compact ? "items-center" : "px-2"}`}>
                            {Array.from({ length: items }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center h-[52px] ${compact ? "justify-center w-[52px]" : "gap-4 px-5 mx-2"}`}
                                >
                                    <div className="w-6 h-6 rounded-lg bg-white/10 shrink-0"></div>
                                    {!compact && <div className="h-3 w-24 bg-white/[0.07] rounded-full"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 shrink-0 h-[88px] flex items-center justify-center">
                <div
                    className={`h-14 rounded-[20px] bg-surface-800 border border-line-soft flex items-center gap-3 ${compact ? "w-14 justify-center" : "w-full px-2"}`}
                >
                    <div className="w-10 h-10 rounded-[14px] bg-brand/20 shrink-0"></div>
                    {!compact && (
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-20 bg-white/10 rounded-full"></div>
                            <div className="h-2 w-14 bg-white/5 rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SidebarShimmering;

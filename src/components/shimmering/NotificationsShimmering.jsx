// Notification rows (avatar with type badge, text, time). With `withHeader` it is the whole Notifications page,
// otherwise only the rows, for the page's own list while it loads (or loads more)
const NotificationsShimmering = ({ rows = 6, withHeader = true, label = "Loading notifications" }) => {
    const list = (
        <div className="flex flex-col gap-2.5">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3.5 p-3.5 md:p-4 rounded-[18px] border border-white/5 bg-surface-800"
                >
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-white/10 border border-white/10"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500/15 border-2 border-surface-800"></div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className={`h-3 bg-white/10 rounded-full ${index % 2 ? "w-3/5" : "w-4/5"}`}></div>
                        <div className="h-2.5 w-2/5 bg-white/5 rounded-full"></div>
                        <div className="h-2 w-12 bg-white/5 rounded-full"></div>
                    </div>
                    <div className="hidden sm:block w-12 h-12 rounded-xl bg-white/5 border border-white/10 shrink-0"></div>
                </div>
            ))}
        </div>
    );

    if (!withHeader) {
        return (
            <div role="status" aria-label={label} aria-busy="true" className="motion-safe:animate-pulse">
                {list}
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label={label}
            aria-busy="true"
            className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10 motion-safe:animate-pulse"
        >
            <div className="flex items-end justify-between mb-6 gap-4">
                <div>
                    <div className="h-2.5 w-20 bg-brand/20 rounded-full mb-2"></div>
                    <div className="h-7 md:h-8 w-52 md:w-60 bg-white/10 rounded-lg"></div>
                    <div className="h-3 w-28 bg-white/5 rounded-full mt-3"></div>
                </div>
            </div>
            {list}
        </div>
    );
};

export default NotificationsShimmering;

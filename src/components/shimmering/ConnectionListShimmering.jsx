// Rows of the Connections tab on your own profile (avatar, name, handle, Message button)
const ConnectionListShimmering = ({ count = 4 }) => {
    return (
        <div
            role="status"
            aria-label="Loading connections"
            aria-busy="true"
            className="flex flex-col gap-2 motion-safe:animate-pulse"
        >
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-transparent">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-full bg-neutral-800 border-[2px] border-neutral-800 shrink-0"></div>
                        <div className="flex flex-col gap-2 min-w-0">
                            <div className="h-3.5 w-32 bg-white/10 rounded-full"></div>
                            <div className="h-3 w-24 bg-white/5 rounded-full"></div>
                        </div>
                    </div>
                    <div className="ml-4 h-10 w-[118px] rounded-full bg-white/10 shrink-0"></div>
                </div>
            ))}
        </div>
    );
};

export default ConnectionListShimmering;

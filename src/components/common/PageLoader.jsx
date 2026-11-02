// Generic page skeleton: shown while a page without a skeleton of its own is loading (pages are loaded on first
// visit, see App.jsx; RouteShimmering picks the matching skeleton for pages that have one)
export default function PageLoader() {
    return (
        <div
            role="status"
            aria-label="Loading page"
            aria-busy="true"
            className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10 motion-safe:animate-pulse"
        >
            <div className="h-2.5 w-24 bg-brand/20 rounded-full mb-2"></div>
            <div className="h-7 md:h-8 w-48 bg-white/10 rounded-lg mb-6"></div>

            <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-[22px] border border-white/5 bg-surface-800 space-y-3">
                        <div className="h-3.5 w-1/3 bg-white/10 rounded-full"></div>
                        <div className="h-3 w-full bg-white/5 rounded-full"></div>
                        <div className="h-3 w-4/5 bg-white/5 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

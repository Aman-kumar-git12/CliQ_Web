import FindPeopleShimmering from "./FindPeopleShimmering";

// The Search page before its code has loaded: title, search box, tabs, intro and the Suggested Network list
const SearchShimmering = () => {
    return (
        <div
            role="status"
            aria-label="Loading search"
            aria-busy="true"
            className="w-full min-h-screen text-white px-4 md:px-0 pt-[90px] md:pt-10 pb-28 md:pb-10 motion-safe:animate-pulse"
        >
            <div className="h-7 md:h-8 w-32 bg-white/10 rounded-lg mb-5"></div>

            {/* Search box */}
            <div className="h-[51px] w-full rounded-[16px] bg-surface-800 border border-white/5 mb-4 flex items-center px-5 gap-3">
                <div className="w-4 h-4 rounded-full bg-white/10"></div>
                <div className="h-3 w-2/3 bg-white/5 rounded-full"></div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-6">
                {["w-[52px]", "w-[78px]", "w-[68px]", "w-[94px]"].map((width) => (
                    <div
                        key={width}
                        className={`h-[33px] ${width} rounded-xl bg-white/[0.03] border border-white/5`}
                    ></div>
                ))}
            </div>

            {/* Intro text */}
            <div className="space-y-2 mb-8">
                <div className="h-3 w-full bg-white/5 rounded-full"></div>
                <div className="h-3 w-3/5 bg-white/5 rounded-full"></div>
            </div>

            {/* Suggested Network */}
            <section className="space-y-5 w-full">
                <div className="flex items-center justify-between gap-4">
                    <div className="h-2.5 w-40 bg-white/10 rounded-full"></div>
                    <div className="h-9 w-[68px] rounded-[14px] bg-surface-700 border border-white/5"></div>
                </div>
                <FindPeopleShimmering count={5} nested />
            </section>
        </div>
    );
};

export default SearchShimmering;

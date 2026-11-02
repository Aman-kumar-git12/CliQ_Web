import FindPeopleShimmering from "./FindPeopleShimmering";

const SectionTitleShimmer = ({ width = "w-24" }) => (
    <div className={`h-2.5 ${width} bg-white/10 rounded-full mb-3`}></div>
);

// Search results while a query (or tab) loads: the sections the chosen tab shows, in the page's order
// (hashtags, people, posts)
const SearchResultsShimmering = ({ tab = "all" }) => {
    const show = (section) => tab === "all" || tab === section;
    const single = tab !== "all";

    return (
        <div
            role="status"
            aria-label="Loading search results"
            aria-busy="true"
            className="flex flex-col gap-8 motion-safe:animate-pulse"
        >
            {show("hashtags") && (
                <section>
                    <SectionTitleShimmer width="w-20" />
                    <div className="flex flex-wrap gap-2">
                        {["w-24", "w-32", "w-20", "w-28", "w-24", "w-36"].slice(0, single ? 6 : 4).map((width, i) => (
                            <div
                                key={i}
                                className={`h-[38px] ${width} rounded-xl bg-surface-800 border border-white/5`}
                            ></div>
                        ))}
                    </div>
                </section>
            )}

            {show("people") && (
                <section className="space-y-5 w-full">
                    <div className="flex items-center justify-between gap-4">
                        <div className="h-2.5 w-16 bg-white/10 rounded-full"></div>
                        <div className="h-9 w-[68px] rounded-[14px] bg-surface-700 border border-white/5"></div>
                    </div>
                    <FindPeopleShimmering count={single ? 5 : 3} nested />
                </section>
            )}

            {show("posts") && (
                <section>
                    <SectionTitleShimmer width="w-16" />
                    <div className="flex flex-col gap-2.5">
                        {Array.from({ length: single ? 4 : 2 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-[18px] border border-white/5 bg-surface-800">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10"></div>
                                    <div className="h-3 w-28 bg-white/10 rounded-full"></div>
                                    <div className="h-2 w-10 bg-white/5 rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-white/[0.07] rounded-full"></div>
                                    <div className="h-3 w-4/5 bg-white/[0.07] rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="h-2.5 w-8 bg-white/5 rounded-full"></div>
                                    <div className="h-2.5 w-8 bg-white/5 rounded-full"></div>
                                    <div className="h-2.5 w-12 bg-violet-500/10 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchResultsShimmering;

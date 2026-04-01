import { useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function PeoplePage() {
    const location = useLocation();

    // Ensure the discovery module starts at the top on mobile whenever tab/pathname changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "instant"
                });
            });
        }
    }, [location.pathname]);

    // Determine active tab based on URL path
    const getActiveTab = () => {
        if (location.pathname.includes("/find/getconnection")) return "getconnection";
        return "find";
    };

    const activeTab = getActiveTab();

    return (
        <div className="w-full relative min-h-screen md:h-[100dvh] pt-[85px] md:pt-2 pb-24 md:pb-0 bg-transparent overflow-visible md:overflow-hidden flex flex-col px-4 md:px-0 no-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {/* Segmented Nav - transparent outer wrapper, styled inner box */}
            <div className="z-50 pb-3 md:pb-2 shrink-0 sticky top-[70px] md:top-0 flex justify-center">
                <div className="relative flex w-full max-w-full md:max-w-3xl border border-white/10 rounded-[22px] overflow-hidden bg-transparent p-1.5 shadow-2xl relative z-50">
                    {/* Sliding Active Background */}
                    <motion.div
                        layoutId="activeTabSegment"
                        className="absolute inset-y-1.5 bg-indigo-200/60 md:bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-[18px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] md:shadow-none pointer-events-none"
                        style={{ left: "1.5px" }}
                        initial={false}
                        animate={{
                            x: activeTab === "getconnection" ? 0 : "100%",
                            width: "calc(50% - 3px)"
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 35 }}
                    />

                    <Link
                        to="/find/getconnection"
                        className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-center transition-all duration-500 cursor-pointer block relative z-20 ${activeTab === "getconnection"
                            ? "text-indigo-900 md:text-white"
                            : "text-white/30 hover:text-white/60"
                            }`}
                    >
                        Get Connections
                    </Link>

                    <Link
                        to="/find/findpeople"
                        className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-center transition-all duration-500 cursor-pointer block relative z-20 ${activeTab === "find"
                            ? "text-indigo-900 md:text-white"
                            : "text-white/30 hover:text-white/60"
                            }`}
                    >
                        Find People
                    </Link>
                </div>
            </div>

            {/* Tab Content */}
            <div className="relative z-10 px-0 max-w-full flex-1 min-h-0 overflow-visible md:overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
}

import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import MobileTopBar from "../components/layout/MobileTopBar";
import ErrorBoundary from "../components/common/ErrorBoundary";
import RouteShimmering from "../components/shimmering/RouteShimmering";
import { mainLayoutWidthClass } from "../utils/pageWidth";

export default function MainLayout() {
    const { pathname } = useLocation();

    // Scroll to top on route change, except for Home, Profile sub-tabs, and Chat
    useEffect(() => {
        if (pathname !== "/home" && !pathname.startsWith("/chat") && !pathname.startsWith("/profile")) {
            // "instant": html has scroll-behavior: smooth, which would otherwise glide up through the old page
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    }, [pathname]);

    return (
        <div className="w-full relative min-h-screen bg-transparent text-white flex overflow-hidden">
            <div className="w-full min-h-screen relative z-10 bg-transparent">
                {!pathname.startsWith("/chat") && !pathname.startsWith("/post/") && <MobileTopBar />}

                <div
                    className={`${mainLayoutWidthClass(pathname)} mx-auto min-h-screen flex justify-center overflow-visible bg-transparent`}
                >
                    {/* Page animations follow the system "reduce motion" setting (movement off, fades kept) */}
                    <MotionConfig reducedMotion="user">
                        <ErrorBoundary key={pathname}>
                            {/* While a page's code downloads, its own skeleton shows (the same one it shows while its data loads) */}
                            <Suspense fallback={<RouteShimmering pathname={pathname} />}>
                                <Outlet />
                            </Suspense>
                        </ErrorBoundary>
                    </MotionConfig>
                </div>
            </div>
        </div>
    );
}

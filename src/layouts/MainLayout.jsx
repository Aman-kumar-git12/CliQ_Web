import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileTopBar from "../components/layout/MobileTopBar";
import { Suspense } from "react";
import ErrorBoundary from "../components/common/ErrorBoundary";
import RouteShimmering from "../components/shimmering/RouteShimmering";
import { mainLayoutWidthClass } from "../utils/pageWidth";

export default function MainLayout() {
    const { pathname } = useLocation();

    // Scroll to top on route change, except for Home, Profile sub-tabs, and Chat
    useEffect(() => {
        if (pathname !== "/home" && !pathname.startsWith("/chat") && !pathname.startsWith("/profile")) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return (
        <div className="w-full relative min-h-screen bg-transparent text-white flex overflow-hidden">
            <div className="w-full min-h-screen relative z-10 bg-transparent">
                {!pathname.startsWith("/chat") && !pathname.startsWith("/post/") && <MobileTopBar />}

                <div
                    className={`${mainLayoutWidthClass(pathname)} mx-auto min-h-screen transition-all duration-500 flex justify-center overflow-visible bg-transparent`}
                >
                    <ErrorBoundary key={pathname}>
                        {/* While a page's code downloads, its own skeleton shows (the same one it shows while its data loads) */}
                        <Suspense fallback={<RouteShimmering pathname={pathname} />}>
                            <Outlet />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
}

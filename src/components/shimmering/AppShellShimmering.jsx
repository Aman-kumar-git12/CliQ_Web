import LoadingChat from "../chat/LoadingChat";
import { mainLayoutWidthClass } from "../../utils/pageWidth";
import MyConnectionShimmering from "./MyConnectionShimmering";
import RouteShimmering from "./RouteShimmering";
import SidebarShimmering from "./SidebarShimmering";

/**
 * The signed-in app's frame (sidebar, mobile bars, page column) with the requested page's skeleton inside, shown
 * while the session is checked. Mirrors AuthenticatedLayout + MainLayout / ChatLayout, so the page appears in
 * place of its skeleton instead of after a spinner.
 * @param {{ pathname: string }} props
 */
export default function AppShellShimmering({ pathname }) {
    const isChatView = pathname.startsWith("/messages") || pathname.startsWith("/chat");
    const threadOpen = pathname.startsWith("/messages/");

    return (
        <div
            className={`flex w-full ${isChatView ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-hidden"} bg-surface-950 text-white relative`}
        >
            <div aria-hidden="true">
                <SidebarShimmering compact={isChatView} />
            </div>

            {isChatView ? (
                <div className="flex-1 w-full min-w-0 h-full flex md:pl-[90px]">
                    <div
                        className={`w-full md:w-[310px] shrink-0 h-full flex-col border-r border-white/5 bg-surface-800/60 ${threadOpen ? "hidden md:flex" : "flex"}`}
                    >
                        <MyConnectionShimmering />
                    </div>
                    <div className={`flex-1 h-full min-w-0 ${threadOpen ? "block" : "hidden md:block"}`}>
                        {threadOpen && <LoadingChat />}
                    </div>
                </div>
            ) : (
                <div className="flex-1 w-full min-w-0 md:pl-[260px]">
                    {/* Mobile top bar */}
                    {!pathname.startsWith("/post/") && (
                        <div
                            aria-hidden="true"
                            className="fixed top-0 left-0 w-full h-[70px] bg-gradient-to-b from-surface-night to-black/95 border-b border-purple-500/20 flex items-center justify-between px-6 z-[100] md:hidden"
                        >
                            <div className="h-6 w-20 rounded-lg bg-white/10 motion-safe:animate-pulse"></div>
                            <div className="h-9 w-9 rounded-xl bg-white/5 motion-safe:animate-pulse"></div>
                        </div>
                    )}
                    <div
                        className={`${mainLayoutWidthClass(pathname)} mx-auto min-h-screen flex justify-center overflow-visible`}
                    >
                        <RouteShimmering pathname={pathname} />
                    </div>
                </div>
            )}
        </div>
    );
}

// @ts-check
/**
 * Max-width class of MainLayout's page column for a path: the feed is wide, Explore / Requests / Expertise
 * Studio / chat use the full width, every other page is a narrow column. Shared with the loading frame shown
 * while the session is checked, so a page's skeleton sits where the page will.
 * @param {string} pathname
 */
export const mainLayoutWidthClass = (pathname) => {
    if (pathname === "/home") return "max-w-[1200px]";
    const isChatView = pathname.startsWith("/messages") || pathname.startsWith("/chat");
    const isConnectionsView = pathname.startsWith("/find") || pathname.startsWith("/requests");
    if (isChatView || isConnectionsView || pathname === "/my-experties") return "max-w-none";
    return "max-w-2xl";
};

import PageLoader from "../common/PageLoader";
import LoadingChat from "../chat/LoadingChat";
import AuthShimmering from "./AuthShimmering";
import CreatePostShimmering from "./CreatePostShimmering";
import EditProfileShimmering from "./EditProfileShimmering";
import ExpertiseStudioShimmering from "./ExpertiseStudioShimmering";
import GetConnectionsShimmering from "./GetConnectionsShimmering";
import HomeShimmering from "./HomeShimmering";
import IndividualPostShimmering from "./IndividualPostShimmering";
import NotificationsShimmering from "./NotificationsShimmering";
import ProfileShimmering from "./ProfileShimmering";
import RequestsShimmering from "./RequestsShimmering";
import SavedPostsShimmering from "./SavedPostsShimmering";
import SearchShimmering from "./SearchShimmering";
import SettingsShimmering from "./SettingsShimmering";

/**
 * The skeleton of the page at `pathname`: the same one the page shows while its data loads, so the placeholder
 * keeps its shape from the session check through the code download to the data. Pages without one get the
 * generic PageLoader.
 * @param {{ pathname: string }} props
 */
export default function RouteShimmering({ pathname }) {
    if (pathname === "/home") return <HomeShimmering />;
    if (pathname.startsWith("/profile") || pathname.startsWith("/public-profile/") || pathname.startsWith("/user/"))
        return <ProfileShimmering />;
    if (pathname === "/edit-profile") return <EditProfileShimmering />;
    if (pathname === "/settings") return <SettingsShimmering />;
    if (pathname.startsWith("/find")) return <GetConnectionsShimmering withFrame />;
    if (pathname === "/requests") return <RequestsShimmering />;
    if (pathname === "/notifications") return <NotificationsShimmering />;
    if (pathname === "/search") return <SearchShimmering />;
    if (pathname === "/saved") return <SavedPostsShimmering />;
    if (pathname.startsWith("/post/")) return <IndividualPostShimmering />;
    if (pathname === "/create/post") return <CreatePostShimmering />;
    if (pathname === "/my-experties") return <ExpertiseStudioShimmering />;
    if (pathname.startsWith("/messages/")) return <LoadingChat />;
    if (pathname === "/" || pathname === "/login") return <AuthShimmering />;
    if (["/verify-email", "/verify-otp", "/blocked-account"].includes(pathname))
        return <AuthShimmering variant="card" />;
    return <PageLoader />;
}

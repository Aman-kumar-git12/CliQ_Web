import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import AppShellShimmering from "../components/shimmering/AppShellShimmering";

const ProtectedRoute = () => {
    const { user, loading, blockedAccount } = useUserContext();
    const { pathname } = useLocation();

    // While the session is checked, the app's frame and the requested page's skeleton are already drawn,
    // so the page appears in place instead of after a blank screen with a spinner
    if (loading) return <AppShellShimmering pathname={pathname} />;

    if (blockedAccount) {
        return <Navigate to="/blocked-account" replace />;
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

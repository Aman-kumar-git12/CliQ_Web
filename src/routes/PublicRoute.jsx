import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import AuthShimmering from "../components/shimmering/AuthShimmering";

const PublicRoute = () => {
    const { user, loading } = useUserContext();

    // Login / signup skeleton while the session is checked
    if (loading) return <AuthShimmering />;

    return user ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;

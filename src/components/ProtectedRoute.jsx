import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import React from "react";

const ProtectedRoute = () => {
  const { user, loading, blockedAccount } = useUserContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (blockedAccount) {
    return <Navigate to="/blocked-account" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

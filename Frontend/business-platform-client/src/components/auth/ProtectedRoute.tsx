import { Navigate, Outlet } from "react-router-dom";
import { useAuth  } from "../../hooks/auth/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
    permission?: string;
}

export default function ProtectedRoute({
    allowedRoles,
    permission,
}: ProtectedRouteProps) {
    const {
        isAuthenticated,
        hasRole,
        hasPermission,
    } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        !hasRole(allowedRoles)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    if (
        permission &&
        !hasPermission(permission)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
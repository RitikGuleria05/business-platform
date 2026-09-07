import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../../services/authStorage";

function ProtectedRoute() {
    const token = authStorage.getAccessToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
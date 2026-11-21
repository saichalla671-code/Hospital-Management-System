import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);

        const currentTime = Date.now() / 1000;

        // Check token expiration
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

        const role = decodedToken.role;

        // Check role
        if (allowedRoles && !allowedRoles.includes(role)) {
            return <Navigate to="/dashboard" replace />;
        }

        return children;

    } catch (error) {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role, loginPath = "/login" }) {
    const user = JSON.parse(localStorage.getItem("metroUser"));
    const token = localStorage.getItem("metroToken");

    if (!token || !user) {
        return <Navigate to={loginPath} />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;

// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;

    return auth?.id ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

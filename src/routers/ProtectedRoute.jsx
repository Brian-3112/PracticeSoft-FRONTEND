// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;
    //si hay usuario autenticado entra a las rutas de lo contario  redirige al usuario al login
    return auth?.id ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

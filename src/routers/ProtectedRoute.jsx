// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { auth, loading } = useAuth();
    const location = useLocation();
    const temporalBlockedRoutes = ['/admin/dashboard', '/admin/documentacion', '/admin/configuracion'];
    const user = auth?.usuario ?? auth?.user ?? auth?.data?.usuario ?? auth?.data ?? auth ?? {};
    const role = user?.role ?? auth?.role;
    const isTemporary = user?.isTemporary ?? auth?.isTemporary;

    if (loading) return <p>Cargando...</p>;
    if ((role === 'temporal' || isTemporary) && temporalBlockedRoutes.includes(location.pathname)) {
        return <Navigate to="/admin/disponibilidad" replace />;
    }
    //si hay usuario autenticado entra a las rutas de lo contario  redirige al usuario al login
    return auth?.id ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

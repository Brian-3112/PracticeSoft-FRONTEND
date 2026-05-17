import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { hasModuleAccess, getFirstAllowedAdminRoute } from '../utils/moduleAccess';

const routeModuleMap = {
  '/admin/disponibilidad': 'disponibilidad',
  '/admin/dashboard': 'dashboard',
  '/admin/clientes': 'clientes',
  '/admin/vehiculos': 'vehiculos',
  '/admin/rentas': 'rentas',
  '/admin/documentacion': 'documentacion',
  '/admin/configuracion': 'configuracion',
};

const ProtectedRoute = () => {
  const { auth, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Cargando...</p>;
  if (!auth?.id) return <Navigate to="/login" />;

  const moduleKey = routeModuleMap[location.pathname];
  if (moduleKey && !hasModuleAccess(moduleKey, auth)) {
    return <Navigate to={getFirstAllowedAdminRoute(auth)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

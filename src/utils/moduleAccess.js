export const normalizeModuleName = (value = '') => String(value).trim().toLowerCase();
export const getUserFromAuthPayload = (payload = {}) => {
  if (payload?.usuario && typeof payload.usuario === 'object') return payload.usuario;
  if (payload?.user && typeof payload.user === 'object') return payload.user;
  if (payload?.data?.usuario && typeof payload.data.usuario === 'object') return payload.data.usuario;
  if (payload?.data && typeof payload.data === 'object') return payload.data;
  return payload;
};
export const getNormalizedAllowedModules = (user = {}) => {
  const modules = user?.allowedModules;
  if (!Array.isArray(modules)) return [];
  return [...new Set(modules.map(normalizeModuleName).filter(Boolean))];
};
export const hasModuleAccess = (moduleName, payload = {}) => {
  const user = getUserFromAuthPayload(payload);
  const role = normalizeModuleName(user?.role ?? payload?.role);
  if (role === 'admin') return true;
  if (role !== 'empleado' && !user?.isTemporary && !payload?.isTemporary) return true;
  const allowed = getNormalizedAllowedModules(user);
  return allowed.includes(normalizeModuleName(moduleName));
};
export const getFirstAllowedAdminRoute = (payload = {}) => {
  const modulesRouteMap = { disponibilidad:'/admin/disponibilidad', dashboard:'/admin/dashboard', clientes:'/admin/clientes', vehiculos:'/admin/vehiculos', rentas:'/admin/rentas', documentacion:'/admin/documentacion', configuracion:'/admin/configuracion' };
  const user = getUserFromAuthPayload(payload);
  const allowed = getNormalizedAllowedModules(user);
  const first = allowed.find((mod) => modulesRouteMap[mod]);
  return first ? modulesRouteMap[first] : '/admin/disponibilidad';
};

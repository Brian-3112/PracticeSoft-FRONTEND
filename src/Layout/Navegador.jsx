
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const IconDashboard = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" fill="currentColor"/></svg>
);
const IconDisponibilidad = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 2v2M17 2v2M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M8 13h3v3H8z" fill="currentColor"/></svg>
);
const IconClientes = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4Zm-8 1c-2.33 0-7 1.17-7 3.5V20h5v-2c0-1.14.59-2.15 1.57-3Z" fill="currentColor"/></svg>
);
const IconVehiculos = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7h-2v-2H7v2H5v-7Zm2.1-1h9.8l-.9-2.6a.5.5 0 0 0-.47-.34H8.47a.5.5 0 0 0-.47.34L7.1 10ZM7.5 14A1.5 1.5 0 1 0 9 15.5 1.5 1.5 0 0 0 7.5 14Zm9 0a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5Z" fill="currentColor"/></svg>
);
const IconRentas = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 12h8M8 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);

const IconDocumentacion = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.2l1.6 2H18a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.2 13.3 1.9 1.9 4-4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconConfiguracion = () => (
  <svg className={styles.settingsIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" stroke="currentColor" strokeWidth="1.7"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.38a1.7 1.7 0 0 0-1 .62 1.7 1.7 0 0 0-.4 1.08V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.22 15a1.7 1.7 0 0 0-.62-1 1.7 1.7 0 0 0-1.08-.4H2.5a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.1 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.5 4.22a1.7 1.7 0 0 0 1-.62 1.7 1.7 0 0 0 .4-1.08V2.5a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.1a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.38 8.5a1.7 1.7 0 0 0 .62 1 1.7 1.7 0 0 0 1.08.4H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
);

const menuItems = [
  { to: '/admin/disponibilidad', label: 'Disponibilidad', icon: IconDisponibilidad, key: 'disponibilidad' },
  { to: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard, key: 'dashboard' },
  { to: '/admin/clientes', label: 'Clientes', icon: IconClientes, key: 'clientes' },
  { to: '/admin/vehiculos', label: 'Vehículos', icon: IconVehiculos, key: 'vehiculos' },
  { to: '/admin/rentas', label: 'Rentas', icon: IconRentas, key: 'rentas' },
  { to: '/admin/documentacion', label: 'Documentación', icon: IconDocumentacion, key: 'documentacion' },
];
import { hasModuleAccess, getUserFromAuthPayload } from '../utils/moduleAccess';

const getAllowedMenuItems = (auth = {}) => {
  const user = getUserFromAuthPayload(auth);
  return menuItems.filter((item) => hasModuleAccess(item.key, user));
};

const getPageTitle = (pathname) => {
  if (pathname.includes('/clientes')) return 'Clientes';
  if (pathname.includes('/disponibilidad')) return 'Disponibilidad';
  if (pathname.includes('/vehiculos')) return 'Vehículos';
  if (pathname.includes('/rentas')) return 'Rentas';
  if (pathname.includes('/documentacion')) return 'Documentación';
  if (pathname.includes('/configuracion')) return 'Configuración';
  return 'Dashboard';
};

const getPageSubtitle = (pathname) => {
  if (pathname.includes('/clientes')) return 'Gestión de clientes';
  if (pathname.includes('/disponibilidad')) return 'Calendario de disponibilidad por vehículo';
  if (pathname.includes('/vehiculos')) return 'Gestión de vehículos';
  if (pathname.includes('/rentas')) return 'Alquiler - Reservas';
  if (pathname.includes('/documentacion')) return 'Contratos firmados y escaneados';
  if (pathname.includes('/configuracion')) return 'Perfil y seguridad de la cuenta';
  return 'Resumen general de operaciones';
};


const getUserFromAuth = (auth = {}) => {
  if (auth?.usuario && typeof auth.usuario === 'object') return auth.usuario;
  if (auth?.user && typeof auth.user === 'object') return auth.user;
  if (auth?.data?.usuario && typeof auth.data.usuario === 'object') return auth.data.usuario;
  if (auth?.data && typeof auth.data === 'object') return auth.data;
  return auth;
};

const getUserDisplayName = (auth = {}) => {
  const user = getUserFromAuth(auth);

  const nombre = String(user?.nombre ?? '').trim();
  const apellido = String(user?.apellido ?? '').trim();
  const fullName = `${nombre} ${apellido}`.trim();

  if (fullName) return fullName;

  return 'Usuario';
};

const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'US';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
};

const Navegador = () => {
  const { auth, loading, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return 'Cargando...';
  const query = searchParams.get('q') ?? '';
  const allowedMenuItems = getAllowedMenuItems(auth);
  const currentUser = getUserFromAuthPayload(auth);
  const isAdmin = (currentUser?.role ?? auth?.role) === 'admin';

  const userDisplayName = getUserDisplayName(auth);
  const userInitials = getInitials(userDisplayName);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const nextParams = new URLSearchParams(location.search);

    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');

    navigate(`${location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ''}`, { replace: true });
  };

  return (
    <div className={styles.appLayout}>
      {menuOpen && <button type="button" className={styles.mobileOverlay} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoSection}>
          <svg className={styles.brandCarIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11v7h-2v-2H7v2H5v-7Z" stroke="currentColor" strokeWidth="1.7"/>
            <circle cx="8" cy="15.5" r="1.3" fill="currentColor" />
            <circle cx="16" cy="15.5" r="1.3" fill="currentColor" />
          </svg>
          <div>
            <h1 className={styles.brandTitle}>ANTIOCAR</h1>
            <p className={styles.brandSubtitle}>Panel interno</p>
          </div>
        </div>

        <nav className={styles.menuNav}>
          <p className={styles.menuLabel}>Módulos</p>
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`${styles.menuLink} ${location.pathname === item.to ? styles.menuLinkActive : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          {isAdmin && (
            <Link
              to="/admin/configuracion"
              onClick={() => setMenuOpen(false)}
              className={`${styles.settingsLink} ${location.pathname === '/admin/configuracion' ? styles.settingsLinkActive : ''}`}
            >
              <IconConfiguracion />
              <span>Configuración</span>
            </Link>
          )}
          <button type="button" onClick={cerrarSesion} className={styles.logoutButton}>
            <svg className={styles.logoutIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true">
              <path d="M232-172q-26 0-43-17t-17-43v-114h28v114q0 12 10 22t22 10h496q12 0 22-10t10-22v-496q0-12-10-22t-22-10H232q-12 0-22 10t-10 22v114h-28v-114q0-26 17-43t43-17h496q26 0 43 17t17 43v496q0 26-17 43t-43 17H232Zm206-164-20-20 110-110H172v-28h356L418-604l20-20 144 144-144 144Z"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
          <div className={styles.userCard}>
            <div className={styles.userBadge}>{userInitials}</div>
            <div>
              <p className={styles.userName}>{userDisplayName}</p>
              <p className={styles.userRole}>{isAdmin ? 'Administrador' : 'Usuario temporal'}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.contentArea}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuToggle} onClick={() => setMenuOpen((prev) => !prev)} aria-label="Abrir menú">
            ☰
          </button>
          <div>
            <div>
              <h2 className={styles.topbarTitle}>{getPageTitle(location.pathname)}</h2>
            <p className={styles.topbarSubtitle}>{getPageSubtitle(location.pathname)}</p>
            </div>
          </div>
          <div className={styles.topbarActions}>
            <input className={styles.searchInput} placeholder="Buscar..." value={query} onChange={handleSearchChange} />
          </div>
        </header>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Navegador;

import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const IconDashboard = () => (
  <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" fill="currentColor"/></svg>
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

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: IconDashboard },
  { to: '/admin/clientes', label: 'Clientes', icon: IconClientes },
  { to: '/admin/vehiculos', label: 'Vehículos', icon: IconVehiculos },
  { to: '/admin/rentas', label: 'Rentas', icon: IconRentas },
];

const getPageTitle = (pathname) => {
  if (pathname.includes('/clientes')) return 'Clientes';
  if (pathname.includes('/vehiculos')) return 'Vehículos';
  if (pathname.includes('/rentas')) return 'Rentas';
  return 'Dashboard';
};

const getPageSubtitle = (pathname) => {
  if (pathname.includes('/clientes')) return 'Gestión de clientes';
  if (pathname.includes('/vehiculos')) return 'Gestión de vehículos';
  if (pathname.includes('/rentas')) return 'Alquiler - Reservas';
  return 'Resumen general de operaciones';
};


const getUserDisplayName = (auth = {}) => {
  const nombre = String(auth.nombre ?? '').trim();
  const apellido = String(auth.apellido ?? '').trim();
  const fullName = `${nombre} ${apellido}`.trim();

  return fullName || nombre || apellido || 'Usuario';
};

const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'US';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
};

const Navegador = () => {
  const { auth, loading, cerrarSesion } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (loading) return 'Cargando...';

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLinkClick = () => setIsMenuOpen(false);
  const query = searchParams.get('q') ?? '';

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
      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}>
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={`${styles.menuLink} ${location.pathname === item.to ? styles.menuLinkActive : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
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
              <p className={styles.userRole}>Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.contentArea}>
        <header className={styles.topbar}>
          <div>
            <h2 className={styles.topbarTitle}>{getPageTitle(location.pathname)}</h2>
            <p className={styles.topbarSubtitle}>{getPageSubtitle(location.pathname)}</p>
          </div>
          <div className={styles.topbarActions}>
            <input className={styles.searchInput} placeholder="Buscar..." value={query} onChange={handleSearchChange} />
            <button type="button" className={styles.menuToggle} onClick={toggleMenu} aria-label="Abrir menú">
              ☰
            </button>
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

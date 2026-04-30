import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const menuItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/vehiculos', label: 'Vehículos' },
  { to: '/admin/rentas', label: 'Rentas' },
];

const getPageTitle = (pathname) => {
  if (pathname.includes('/clientes')) return 'Clientes';
  if (pathname.includes('/vehiculos')) return 'Vehículos';
  if (pathname.includes('/rentas')) return 'Rentas';
  return 'Dashboard';
};

const Navegador = () => {
  const { auth, loading, cerrarSesion } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) return 'Cargando...';

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <div className={styles.appLayout}>
      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoSection}>
          <div>
            <h1 className={styles.brandTitle}>ANTIOCAR</h1>
            <p className={styles.brandSubtitle}>Panel interno</p>
          </div>
        </div>

        <nav className={styles.menuNav}>
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className={`${styles.menuLink} ${location.pathname === item.to ? styles.menuLinkActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button type="button" onClick={cerrarSesion} className={styles.logoutButton}>
            <svg className={styles.logoutIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true">
              <path d="M232-172q-26 0-43-17t-17-43v-114h28v114q0 12 10 22t22 10h496q12 0 22-10t10-22v-496q0-12-10-22t-22-10H232q-12 0-22 10t-10 22v114h-28v-114q0-26 17-43t43-17h496q26 0 43 17t17 43v496q0 26-17 43t-43 17H232Zm206-164-20-20 110-110H172v-28h356L418-604l20-20 144 144-144 144Z"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
          <div className={styles.userCard}>
            <div className={styles.userBadge}>AR</div>
            <div>
              <p className={styles.userName}>Alicia Ramírez</p>
              <p className={styles.userRole}>Administradora</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.contentArea}>
        <header className={styles.topbar}>
          <div>
            <h2 className={styles.topbarTitle}>{getPageTitle(location.pathname)}</h2>
            <p className={styles.topbarSubtitle}>Resumen general de operaciones</p>
          </div>
          <div className={styles.topbarActions}>
            <input className={styles.searchInput} placeholder="Buscar..." />
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

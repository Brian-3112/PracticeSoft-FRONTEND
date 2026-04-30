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
          <div className={styles.logoIcon}>🚗</div>
          <div>
            <h1 className={styles.brandTitle}>RentaCar</h1>
            <p className={styles.brandSubtitle}>Panel interno</p>
          </div>
        </div>

        <nav className={styles.menuNav}>
          <p className={styles.menuLabel}>Módulos</p>
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
            Cerrar sesión
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

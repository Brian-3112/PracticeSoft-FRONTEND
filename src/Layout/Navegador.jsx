import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const Navegador = () => {
  const { auth, loading, cerrarSesion } = useAuth();
  if (loading) return 'Cargando...';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarleft}>
          <span className={styles.brandName}>ANTIOCAR</span>
        </div>
        <ul className={styles.navbarlinkss}>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="clientes">Clientes</Link></li>
          <li><Link to="vehiculos">Vehiculos</Link></li>
          <li><a href="#">Rentas</a></li>
          <li><button
            onClick={cerrarSesion}
            className={styles.logoutButton}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className={styles.logautimg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path  d="M10 17l5-5-5-5v10zm9-15H5c-1.1 0-2 .9-2 2v4h2V4h14v16H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#28A087"/>
            </svg>
          </button></li>

        </ul>
      </nav>

      {/* Aquí se renderizan las rutas hijas como Dashboard */}
      <Outlet />
    </>
  );
};

export default Navegador;

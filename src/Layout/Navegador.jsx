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
            <img src="/logaut.svg" alt="icono de salir" className={styles.logautimg} />
          </button></li>

        </ul>
      </nav>

      {/* Aquí se renderizan las rutas hijas como Dashboard */}
      <Outlet />
    </>
  );
};

export default Navegador;

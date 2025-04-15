import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const Navegador = () => {
  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarleft}>
          <span className={styles.brandName}>ANTIOCAR</span>
        </div>
        <ul className={styles.navbarlinkss}>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><a href="#">Clientes</a></li>
          <li><Link to="vehiculos">Vehiculos</Link></li>
          <li><a href="#">Rentas</a></li>
          <li><a href="#"><img src="/logaut.svg" alt="icono de salir" className={styles.logautimg} /></a></li>

        </ul>
      </nav>

      {/* Aquí se renderizan las rutas hijas como Dashboard */}
      <Outlet />
    </>
  );
};

export default Navegador;

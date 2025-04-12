import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';


const Navegador = () => {

  /// extrayendo la información para la autenticación
  const { auth, loading } = useAuth();
  if (loading == true) return 'Cargando...';


  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarleft}>
        <span className={styles.brandName}>ANTIOCAR</span>
      </div>
      <ul className={styles.navbarlinkss}>
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Clientes</a></li>
        <li><a href="#">Vehiculos</a></li>
        <li><a href="#">Rentas</a></li>
      </ul>
    </nav>
  );
};


export default Navegador;

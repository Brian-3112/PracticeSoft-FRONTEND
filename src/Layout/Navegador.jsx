import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from '../Layout/Navegador.module.css';

const Navegador = () => {
  const { auth, loading, cerrarSesion } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) return 'Cargando...';

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarleft}>
          <span className={styles.brandName}>
            <span className={styles.brandName2}>ANTIO</span>CAR
          </span>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={toggleMenu}
            aria-label="Abrir menú"
          >
            <span className={styles.menuArrow} />
          </button>
        </div>
        <ul
          className={`${styles.navbarlinkss} ${
            isMenuOpen ? styles.navbarlinkssOpen : ''
          }`}
        >
          <li>
            <Link to="/admin" onClick={handleLinkClick}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="clientes" onClick={handleLinkClick}>
              Clientes
            </Link>
          </li>
          <li>
            <Link to="vehiculos" onClick={handleLinkClick}>
              Vehiculos
            </Link>
          </li>
          <li>
            <Link to="rentas" onClick={handleLinkClick}>
              Rentas
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={cerrarSesion}
              className={styles.logoutButton}
            >
              <svg
                className={styles.logautimg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
              >
                <path
                  className={styles.colorimg}
                  d="M232-172q-26 0-43-17t-17-43v-114h28v114q0 12 10 22t22 10h496q12 0 22-10t10-22v-496q0-12-10-22t-22-10H232q-12 0-22 10t-10 22v114h-28v-114q0-26 17-43t43-17h496q26 0 43 17t17 43v496q0 26-17 43t-43 17H232Zm206-164-20-20 110-110H172v-28h356L418-604l20-20 144 144-144 144Z"
                />
              </svg>
            </button>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  );
};

export default Navegador;

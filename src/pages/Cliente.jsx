import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useCliente from '../hooks/useCliente.jsx';
import styles from '../pages/cliente.module.css';
import useAuth from '../hooks/useAuth';
import Agregarcliente from './Agregarcliente.jsx';



const Cliente = () => {
    
    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    const { clientes } = useCliente();


  //------------- CARUCEL
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardsPerPage = 4;

  const totalSlides = Math.ceil(clientes.length / cardsPerPage);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const startIndex = currentSlide * cardsPerPage;
  const visibleClientes = clientes.slice(startIndex, startIndex + cardsPerPage);

  // ⏱ Cambio automático de slide cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : 0));
    }, 15000); // 5000 ms = 5 segundos

    return () => clearInterval(interval); // Limpieza del intervalo
  }, [totalSlides]);




    return (


        <div className={styles.wrapper}>
      <h2 className={styles.heading}>CLIENTES</h2>

      <div className={styles.divAddVehiculo}>
        <Agregarcliente />
      </div>



      <div className={styles.carouselContainer}>
        <button className={styles.navButton} onClick={prevSlide} disabled={currentSlide === 0}>
          ‹
        </button>

        <div className={styles.carousel}>
          {visibleClientes.map((cliente) => (
            <div className={styles.card} key={cliente.id}>
              <div className={styles.bg}></div>
              <div className={styles.blob}></div>

              <p className={styles.cookieHeading}>{cliente.nombre}</p>
              <p className={styles.cookieDescription}><span>C.C </span>{cliente.identificacion}</p>
              <p className={styles.cookieDescription}><span>Direccion </span> {cliente.direccion}</p>
              <p className={styles.cookieDescription}><span>Cel </span> {cliente.celular}</p>

              <div className={styles.buttonContainer}>

                <button className={styles.iconOnlyButton} >
                  <svg className={`${styles.iconButton} ${styles.editar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path className= {`${styles.colorimgg} ${styles.editar}`} d="M200-200h43.92l427.93-427.92-43.93-43.93L200-243.92V-200Zm-40 40v-100.77l527.23-527.77q6.15-5.48 13.57-8.47 7.43-2.99 15.49-2.99t15.62 2.54q7.55 2.54 13.94 9.15l42.69 42.93q6.61 6.38 9.04 14 2.42 7.63 2.42 15.25 0 8.13-2.74 15.56-2.74 7.42-8.72 13.57L260.77-160H160Zm600.77-556.31-44.46-44.46 44.46 44.46ZM649.5-649.5l-21.58-22.35 43.93 43.93-22.35-21.58Z" />
                  </svg>
                </button>

                {/* <button  onClick={() => eliminarVehiculo(vehiculo.id)}  className={styles.iconOnlyButton}>
                  <svg className={`${styles.iconButton} ${styles.eliminar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path className= {`${styles.colorimgg} ${styles.eliminar}`} d="M312-172q-25 0-42.5-17.5T252-232v-488h-40v-28h148v-28h240v28h148v28h-40v488q0 26-17 43t-43 17H312Zm368-548H280v488q0 14 9 23t23 9h336q12 0 22-10t10-22v-488ZM402-280h28v-360h-28v360Zm128 0h28v-360h-28v360ZM280-720v520-520Z" />
                  </svg>
                </button> */}
              </div>
            </div>
          ))}
        </div>

        <button className={styles.navButton} onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>
          ›
        </button>
      </div>
    </div>
        












    );
};

export default Cliente;

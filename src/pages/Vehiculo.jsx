import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useVehiculo from '../hooks/useVehiculo.jsx';
import styles from '../pages/vehiculo.module.css';
import Agregarvehiculo from './Agregarvehiculo.jsx';
import VerInfoVehiculo from './VerInfoVehiculo.jsx';



const Vehiculo = () => {
  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';


  const { vehiculos, eliminarVehiculo } = useVehiculo();

  const [selectedVehiculo, setSelectedVehiculo] = useState(null);



  //------------- CARUCEL
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardsPerPage = 4;

  const totalSlides = Math.ceil(vehiculos.length / cardsPerPage);

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
  const visibleVehiculos = vehiculos.slice(startIndex, startIndex + cardsPerPage);

  // ⏱ Cambio automático de slide cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : 0));
    }, 5000); // 5000 ms = 5 segundos

    return () => clearInterval(interval); // Limpieza del intervalo
  }, [totalSlides]);





  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>VEHICULOS</h2>

      <div className={styles.divAddVehiculo}>
        <Agregarvehiculo />
      </div>



      <div className={styles.carouselContainer}>
        <button className={styles.navButton} onClick={prevSlide} disabled={currentSlide === 0}>
          ‹
        </button>

        <div className={styles.carousel}>
          {visibleVehiculos.map((vehiculo) => (
            <div className={styles.card} key={vehiculo.id}>
              <div className={styles.bg}></div>
              <div className={styles.blob}></div>

              <p className={styles.cookieHeading}>{vehiculo.nombreVehiculo}</p>
              <p className={styles.cookieDescription}><span>Placa. </span>{vehiculo.placa}</p>
              <p className={styles.cookieDescription}><span>Soat. </span> {vehiculo.fechaSOAT}</p>
              <p className={styles.cookieDescription}><span>Tecno. </span> {vehiculo.fechaTecno}</p>

              <div className={styles.buttonContainer}>

                <button className={styles.iconOnlyButton} >
                  <svg className={`${styles.iconButton} ${styles.editar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path className={`${styles.colorimgg} ${styles.editar}`} d="M200-200h43.92l427.93-427.92-43.93-43.93L200-243.92V-200Zm-40 40v-100.77l527.23-527.77q6.15-5.48 13.57-8.47 7.43-2.99 15.49-2.99t15.62 2.54q7.55 2.54 13.94 9.15l42.69 42.93q6.61 6.38 9.04 14 2.42 7.63 2.42 15.25 0 8.13-2.74 15.56-2.74 7.42-8.72 13.57L260.77-160H160Zm600.77-556.31-44.46-44.46 44.46 44.46ZM649.5-649.5l-21.58-22.35 43.93 43.93-22.35-21.58Z" />
                  </svg>
                </button>

                <button onClick={() => eliminarVehiculo(vehiculo.id)} className={styles.iconOnlyButton}>
                  <svg className={`${styles.iconButton} ${styles.eliminar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                    <path className={`${styles.colorimgg} ${styles.eliminar}`} d="M312-172q-25 0-42.5-17.5T252-232v-488h-40v-28h148v-28h240v28h148v28h-40v488q0 26-17 43t-43 17H312Zm368-548H280v488q0 14 9 23t23 9h336q12 0 22-10t10-22v-488ZM402-280h28v-360h-28v360Zm128 0h28v-360h-28v360ZM280-720v520-520Z" />
                  </svg>
                </button>

                <button onClick={() => setSelectedVehiculo(vehiculo)} className={`${styles.iconOnlyButton} ${styles.verButton}`}>
                  <svg className={`${styles.iconButton} ${styles.ver}`} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25V19.5a2.25 2.25 0 0 1-2.25 2.25h-10.5A2.25 2.25 0 0 1 4.5 19.5V4.5A2.25 2.25 0 0 1 6.75 2.25h6L19.5 8.25z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 2.25v6h6" />
                  </svg>
                </button>


              </div>
            </div>
          ))}
        </div>

        <button className={styles.navButton} onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>
          ›
        </button>
      </div>

      {selectedVehiculo && (
        <VerInfoVehiculo
          vehiculo={selectedVehiculo}
          onClose={() => setSelectedVehiculo(null)}
        />
      )}





    </div>
  );
};

export default Vehiculo;

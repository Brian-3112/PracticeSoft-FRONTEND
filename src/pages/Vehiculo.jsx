import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useVehiculo from '../hooks/useVehiculo.jsx';
import styles from '../pages/vehiculo.module.css';

const Vehiculo = () => {
  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';

  const vehiculoData = useVehiculo();
  const vehiculos = vehiculoData?.vehiculos || [];

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
    }, 15000); // 5000 ms = 5 segundos

    return () => clearInterval(interval); // Limpieza del intervalo
  }, [totalSlides]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>VEHICULOS</h2>

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
              <p className={styles.cookieDescription}>Placa: {vehiculo.placa}</p>
              <p className={styles.cookieDescription}>Tránsito: {vehiculo.transito}</p>

              <div className={styles.buttonContainer}>
                <button className={styles.acceptButton}>Editar</button>
                <button className={styles.declineButton}>Eliminar</button>
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

export default Vehiculo;

import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import BotonVerde from '../components/BotonVerde';
import styles from '../pages/vehiculo.module.css';

const Agregarvehiculo = () => {

  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';

  /// Funcionalidad para cerra el modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => { setShow(true); }



  return (
    <div>
      <div>
        <BotonVerde text={'Agregar Vehiculo'} onClick={handleShow} />
      </div>


      {show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleClose}>
              ×
            </button>
            <h2>Agregar Vehículo</h2>
            <p>Contenido del formulario aquí.</p>
            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={handleClose}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default Agregarvehiculo;

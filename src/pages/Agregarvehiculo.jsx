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
      <BotonVerde text="Agregar Vehículo" onClick={handleShow} />

       {show && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalDialog}>
              <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                  <h5 className={styles.modalTitle}>Agregar Vehículo</h5>
                  <button type="button" className={styles.btnClose} onClick={handleClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                  <p>Contenido del formulario aquí.</p>
                </div>

                <div className={styles.modalFooter}>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>
                    Cancelar
                  </button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`}>
                    Guardar
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agregarvehiculo;

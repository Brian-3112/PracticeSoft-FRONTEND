import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import BotonVerde from '../components/BotonVerde';
import styles from '../pages/vehiculo.module.css';
import useVehiculo from '../hooks/useVehiculo.jsx';

const Agregarvehiculo = () => {

  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';


  const { agregarVehiculo } = useVehiculo();

  /// Funcionalidad para cerra el modal
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => { setShow(true); }
  

// Estado para el formulario
  const [formData, setFormData] = useState({
    nombreVehiculo: '',
    placa: '',
    transito: '',
    fechaSOAT: '',
    fechaTecno: '',
    description: ''
  });

  // Manejar cambios en los inputs,  optiene lo que uno va escribienod en los imput, ...formData trae los valores acutales y solo actualice el input que este modificando
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    agregarVehiculo(
      {
        nombreVehiculo: formData.nombreVehiculo.trim(),
        placa: formData.placa.trim(),
        transito: formData.transito.trim(),
        fechaSOAT: formData.fechaSOAT,
        fechaTecno: formData.fechaTecno,
        description: formData.description.trim()
      },
      //  Dejar todos los campos en blanco justo después de enviar los datos
      () => setFormData({
        nombreVehiculo: '',
        placa: '',
        transito: '',
        fechaSOAT: '',
        fechaTecno: '',
        description: ''
      }),
      handleClose
    );
  };


  return (
    <div>
      <BotonVerde text="Agregar Vehículo" onClick={handleShow} />

      {show && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalDialog}>
              <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                  <h5 className={styles.modalTitle}>Agregar <span className={styles.modalTitle2}>Vehículo</span></h5>
                  <button type="button" className={styles.btnClose} onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} >

                  <div className={styles.modalBody}>

                    <div>
                      <label>Nombre del Vehículo</label>
                      <input type="text" name="nombreVehiculo" value={formData.nombreVehiculo} onChange={handleChange} required />
                    </div>

                    <div>
                      <label>Placa</label>
                      <input type="text" name="placa" value={formData.placa} onChange={handleChange} required />
                    </div>

                    <div>
                      <label>Tránsito</label>
                      <input type="text" name="transito" value={formData.transito} onChange={handleChange}  />
                    </div>

                    <div>
                      <label>Fecha SOAT</label>
                      <input type="date" name="fechaSOAT" value={formData.fechaSOAT} onChange={handleChange} required />
                    </div>

                    <div>
                      <label>Fecha Tecnomecánica</label>
                      <input type="date" name="fechaTecno" value={formData.fechaTecno} onChange={handleChange} required />
                    </div>

                    <div>
                      <label>Descripción</label>
                      <textarea name="description" value={formData.description} onChange={handleChange}  />
                    </div>


                  </div>


                  <div className={styles.modalFooter}>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>
                      Cancelar
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>
                      Guardar
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agregarvehiculo;

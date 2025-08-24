import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import BotonVerde from '../components/BotonVerde';
import styles from '../pages/vehiculo.module.css';
import useVehiculo from '../hooks/useVehiculo.jsx';
import { useForm } from 'react-hook-form';


const Agregarvehiculo = () => {

  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';


  const { agregarVehiculo } = useVehiculo();

  /// Funcionalidad para cerra el modal
  const [show, setShow] = useState(false);


  // Manejar cambios en los inputs, optiene lo que uno va escribienod en los imput, ...formData trae los valores acutales y solo actualice el input que este modificando
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
  });

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormData({
      nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
    });
  };

  // Logica cierre modal
  const handleClose = () => { limpiarFormulario(); setShow(false); };
  const handleShow = () => { setShow(true); };



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
      () => {
        limpiarFormulario();
        handleClose();
      }
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
                    <div className={styles.formGrid}>
                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="nombreVehiculo"
                            type="text"
                            placeholder="Vehículo"
                            value={formData.nombreVehiculo}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="placa"
                            type="text"
                            placeholder="Placa"
                            value={formData.placa}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="transito"
                            type="text"
                            placeholder="Tránsito"
                            value={formData.transito}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="description"
                            type="text"
                            placeholder="Descripción"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="fechaSOAT"
                            type="date"
                            placeholder="Soat"
                            value={formData.fechaSOAT}
                            onChange={handleChange}
                            required
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="fechaTecno"
                            type="date"
                            placeholder="Tecnomecanica"
                            value={formData.fechaTecno}
                            onChange={handleChange}
                          />
                        </label>
                      </div>


                    </div>
                  </div>



                  <div className={styles.modalFooter}>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>
                      Cancelar
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
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

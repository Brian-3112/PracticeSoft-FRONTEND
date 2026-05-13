import { useState } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import BotonVerde from '../../components/BotonVerde.jsx';
import styles from '../Vehiculo/vehiculo.module.css';
import useVehiculo from '../../hooks/useVehiculo.jsx';

const initialFormData = {
  nombreVehiculo: '',
  placa: '',
  transito: '',
  fechaSOAT: '',
  fechaTecno: '',
  description: '',
  esSubarriendo: false,
  fechaInicioSubarriendo: '',
  fechaFinSubarriendo: ''
};

const initialErrors = {
  nombreVehiculo: '',
  placa: '',
  fechaSOAT: '',
  fechaTecno: '',
  fechaInicioSubarriendo: '',
  fechaFinSubarriendo: ''
};

const toUpperWithoutSpaces = (value) => String(value).replace(/\s+/g, '').toUpperCase();

// Reglas de validacion para campos obligatorios del vehiculo.
const validateField = (name, value) => {
  const trimmedValue = String(value).trim();

  if (name === 'nombreVehiculo' || name === 'placa') {
    if (!trimmedValue) return 'Campo obligatorio';
    return '';
  }

  if (name === 'fechaSOAT' || name === 'fechaTecno') {
    if (!value) return 'Campo obligatorio';
    return '';
  }

  if (name === 'fechaInicioSubarriendo' || name === 'fechaFinSubarriendo') {
    if (!value) return 'Campo obligatorio para el contrato de subarriendo';
    return '';
  }

  return '';
};

const isFechaFinBeforeInicio = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return false;
  return new Date(fechaFin) < new Date(fechaInicio);
};

const Agregarvehiculo = () => {
  const { loading } = useAuth();

  const { agregarVehiculo } = useVehiculo();
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  if (loading) return 'Cargando...';

  const validateRequiredFields = (dataToValidate) => {
    const nextValidation = {
      nombreVehiculo: validateField('nombreVehiculo', dataToValidate.nombreVehiculo),
      placa: validateField('placa', dataToValidate.placa),
      fechaSOAT: validateField('fechaSOAT', dataToValidate.fechaSOAT),
      fechaTecno: validateField('fechaTecno', dataToValidate.fechaTecno),
      fechaInicioSubarriendo: dataToValidate.esSubarriendo
        ? validateField('fechaInicioSubarriendo', dataToValidate.fechaInicioSubarriendo)
        : '',
      fechaFinSubarriendo: dataToValidate.esSubarriendo
        ? validateField('fechaFinSubarriendo', dataToValidate.fechaFinSubarriendo)
        : ''
    };

    if (
      dataToValidate.esSubarriendo
      && !nextValidation.fechaInicioSubarriendo
      && !nextValidation.fechaFinSubarriendo
      && isFechaFinBeforeInicio(dataToValidate.fechaInicioSubarriendo, dataToValidate.fechaFinSubarriendo)
    ) {
      nextValidation.fechaFinSubarriendo = 'La fecha fin no puede ser menor a la fecha de inicio';
    }

    return nextValidation;
  };

  // Valida en tiempo real mientras el usuario escribe.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'esSubarriendo' && !checked
        ? { fechaInicioSubarriendo: '', fechaFinSubarriendo: '' }
        : {})
    }));

    if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue)
      }));
    }

    if (name === 'esSubarriendo' && !checked) {
      setErrors((prev) => ({
        ...prev,
        fechaInicioSubarriendo: '',
        fechaFinSubarriendo: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const limpiarFormulario = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
  };

  const handleClose = () => {
    limpiarFormulario();
    setShow(false);
  };

  const handleShow = () => {
    setShow(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validateRequiredFields(formData);
    setErrors(nextErrors);

    // Si hay errores, no se envia al backend.
    const hasErrors = Object.values(nextErrors).some((error) => error !== '');
    if (hasErrors) return;

    agregarVehiculo(
      {
        nombreVehiculo: formData.nombreVehiculo.trim().toUpperCase(),
        placa: toUpperWithoutSpaces(formData.placa),
        transito: formData.transito.trim(),
        fechaSOAT: formData.fechaSOAT,
        fechaTecno: formData.fechaTecno,
        description: formData.description.trim()
      },
      () => {
        limpiarFormulario();
        handleClose();
      },
      {
        contratoSubarriendo: formData.esSubarriendo
          ? {
            habilitado: true,
            fechaInicio: formData.fechaInicioSubarriendo,
            fechaFin: formData.fechaFinSubarriendo
          }
          : { habilitado: false }
      }
    );
  };

  return (
    <div>
      <BotonVerde text="Agregar Vehiculo" onClick={handleShow} />

      {show && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalDialog}>
              <div className={styles.modalContent}>

                <div className={styles.modalHeader}>
                  <h5 className={styles.modalTitle}>Agregar <span className={styles.modalTitle2}>Vehiculo</span></h5>
                  <button type="button" className={styles.btnClose} onClick={handleClose}>x</button>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                  <div className={styles.modalBody}>
                    <div className={styles.formGrid}>
                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={`${styles.inputFormu} ${errors.nombreVehiculo ? styles.inputError : ''}`}
                            name="nombreVehiculo"
                            type="text"
                            placeholder="Vehiculo"
                            value={formData.nombreVehiculo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {errors.nombreVehiculo && <span className={styles.fieldError}>{errors.nombreVehiculo}</span>}
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={`${styles.inputFormu} ${errors.placa ? styles.inputError : ''}`}
                            name="placa"
                            type="text"
                            placeholder="Placa"
                            value={formData.placa}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {errors.placa && <span className={styles.fieldError}>{errors.placa}</span>}
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="transito"
                            type="text"
                            placeholder="Transito"
                            value={formData.transito}
                            onChange={handleChange}
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={styles.inputFormu}
                            name="description"
                            type="text"
                            placeholder="Descripcion"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={`${styles.inputFormu} ${errors.fechaSOAT ? styles.inputError : ''}`}
                            name="fechaSOAT"
                            type="date"
                            value={formData.fechaSOAT}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {errors.fechaSOAT && <span className={styles.fieldError}>{errors.fechaSOAT}</span>}
                        </label>
                      </div>

                      <div>
                        <label className={styles.labelFormu}>
                          <input
                            className={`${styles.inputFormu} ${errors.fechaTecno ? styles.inputError : ''}`}
                            name="fechaTecno"
                            type="date"
                            value={formData.fechaTecno}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {errors.fechaTecno && <span className={styles.fieldError}>{errors.fechaTecno}</span>}
                        </label>
                      </div>

                      <section className={styles.subarriendoToggleWrapper}>
                        <div className={styles.subarriendoHeader}>
                          <label className={styles.checkboxLabel} htmlFor="esSubarriendo">
                            <input
                              id="esSubarriendo"
                              name="esSubarriendo"
                              type="checkbox"
                              checked={formData.esSubarriendo}
                              onChange={handleChange}
                            />
                            <span>Subarriendo</span>
                          </label>
                          <small>Chulea esta opción si el vehículo es de subarriendo.</small>
                        </div>

                        {formData.esSubarriendo && (
                          <div className={styles.subarriendoDatesGrid}>
                            <div>
                              <label className={styles.labelFormu}>
                                <span className={styles.inputLabel}>Fecha inicio</span>
                                <input
                                  className={`${styles.inputFormu} ${errors.fechaInicioSubarriendo ? styles.inputError : ''}`}
                                  name="fechaInicioSubarriendo"
                                  type="date"
                                  value={formData.fechaInicioSubarriendo}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                {errors.fechaInicioSubarriendo && <span className={styles.fieldError}>{errors.fechaInicioSubarriendo}</span>}
                              </label>
                            </div>

                            <div>
                              <label className={styles.labelFormu}>
                                <span className={styles.inputLabel}>Fecha fin</span>
                                <input
                                  className={`${styles.inputFormu} ${errors.fechaFinSubarriendo ? styles.inputError : ''}`}
                                  name="fechaFinSubarriendo"
                                  type="date"
                                  value={formData.fechaFinSubarriendo}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                {errors.fechaFinSubarriendo && <span className={styles.fieldError}>{errors.fechaFinSubarriendo}</span>}
                              </label>
                            </div>
                          </div>
                        )}
                      </section>


                    </div>
                  </div>



                  <div className={styles.modalFooter}>
                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>
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

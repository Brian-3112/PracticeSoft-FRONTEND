import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import styles from '../Vehiculo/vehiculo.module.css';
import useVehiculo from '../../hooks/useVehiculo.jsx';

const initialErrors = {
    nombreVehiculo: '',
    placa: '',
    fechaSOAT: '',
    fechaTecno: ''
};

const toUpperWithoutSpaces = (value) => String(value).replace(/\s+/g, '').toUpperCase();

const capitalizeFirstLetter = (value) => String(value).replace(/^(\s*)([a-záéíóúñü])/i, (_, spaces, letter) => `${spaces}${letter.toUpperCase()}`);

const normalizeFieldValue = (name, value) => {
  if (name === 'nombreVehiculo') return String(value).toUpperCase();
  if (name === 'placa') return toUpperWithoutSpaces(value);
  if (name === 'transito' || name === 'description') return capitalizeFirstLetter(value);
  return value;
};

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

    return '';
};

const Editarvehiculo = ({ vehiculo, onClose }) => {

    const { loading } = useAuth();

    const { actualizarVehiculo } = useVehiculo();

    const [formData, setFormData] = useState({
        nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
    });
    const [errors, setErrors] = useState(initialErrors);
    if (loading) return 'Cargando...';

    // Carga los datos del vehiculo seleccionado en el formulario.
    useEffect(() => {
        if (vehiculo) {
            setFormData({
                nombreVehiculo: vehiculo.nombreVehiculo || '',
                placa: vehiculo.placa || '',
                transito: vehiculo.transito || '',
                fechaSOAT: vehiculo.fechaSOAT || '',
                fechaTecno: vehiculo.fechaTecno || '',
                description: vehiculo.description || ''

            });
            setErrors(initialErrors);
        }
    }, [vehiculo]);

    const validateRequiredFields = (dataToValidate) => {
        return {
            nombreVehiculo: validateField('nombreVehiculo', dataToValidate.nombreVehiculo),
            placa: validateField('placa', dataToValidate.placa),
            fechaSOAT: validateField('fechaSOAT', dataToValidate.fechaSOAT),
            fechaTecno: validateField('fechaTecno', dataToValidate.fechaTecno)
        };
    };

    // Valida en tiempo real.
    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = normalizeFieldValue(name, value);
        setFormData((prev) => ({
            ...prev,
            [name]: nextValue
        }));

        if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, nextValue)
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
        setFormData({
            nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
        });
        setErrors(initialErrors);
    };

    const handleClose = () => {
        limpiarFormulario();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nextErrors = validateRequiredFields(formData);
        setErrors(nextErrors);

        // Si hay errores, no se envia al backend.
        const hasErrors = Object.values(nextErrors).some((error) => error !== '');
        if (hasErrors) return;

        actualizarVehiculo(
            vehiculo.id,
            {
                id: vehiculo.id,
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
            }
        );
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <div className={styles.modalDialog}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>
                                Editar <span className={styles.modalTitle2}>Vehiculo</span>
                            </h5>
                            <button type="button" className={styles.btnClose} onClick={handleClose}>
                                x
                            </button>
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
    );
};

export default Editarvehiculo;

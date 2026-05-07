import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import styles from '../Cliente/cliente.module.css';
import useCliente from '../../hooks/useCliente.jsx';

const initialErrors = {
    nombre: '',
    identificacion: '',
    direccion: '',
    celular: ''
};

const toTitleCaseByWords = (value) =>
    String(value).replace(/\b([a-záéíóúñü])/gi, (letter) => letter.toUpperCase());

// Reglas de validacion compartidas para los campos obligatorios.
const validateField = (name, value) => {
    const trimmedValue = value.trim();

    if (name === 'nombre' || name === 'celular') {
        if (!trimmedValue) return 'Campo obligatorio';
        return '';
    }

    if (name === 'identificacion') {
        if (!trimmedValue) return 'Campo obligatorio';
        if (trimmedValue.length < 5 || trimmedValue.length > 20) {
            return 'La identificacion debe tener entre 5 y 20 caracteres';
        }
        return '';
    }

    return '';
};

const Editarcliente = ({ cliente, onClose }) => {

    const { loading } = useAuth();

    const { actualizarCliente } = useCliente();

    const [formData, setFormData] = useState({
        nombre: '', identificacion: '', direccion: '', celular: '', correo: '', nombreFamiliar: '', direccionFamiliar: '', telefonoFamiliar: '', nombrePersonal: '',
        direccionPersonal: '', telefonoPersonal: ''
    });
    const [errors, setErrors] = useState(initialErrors);
    if (loading) return 'Cargando...';

    // Precarga los datos del cliente seleccionado en el formulario.
    useEffect(() => {
        if (cliente) {
            setFormData({
                nombre: cliente.nombre || '',
                identificacion: cliente.identificacion || '',
                direccion: cliente.direccion || '',
                celular: cliente.celular || '',
                correo: cliente.correo || '',
                nombreFamiliar: cliente.nombreFamiliar || '',
                direccionFamiliar: cliente.direccionFamiliar || '',
                telefonoFamiliar: cliente.telefonoFamiliar || '',
                nombrePersonal: cliente.nombrePersonal || '',
                direccionPersonal: cliente.direccionPersonal || '',
                telefonoPersonal: cliente.telefonoPersonal || ''
            });
            setErrors(initialErrors);
        }
    }, [cliente]);

    // Revalida todo al guardar para evitar enviar datos invalidos.
    const validateRequiredFields = (dataToValidate) => {
        return {
            nombre: validateField('nombre', dataToValidate.nombre),
            identificacion: validateField('identificacion', dataToValidate.identificacion),
                        celular: validateField('celular', dataToValidate.celular)
        };
    };

    // Validacion en tiempo real.
    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = name === 'nombre' ? toTitleCaseByWords(value) : value;
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

    // Aplica trim a identificacion y valida al salir del campo.
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const normalizedValue = name === 'identificacion' ? value.trim() : value;

        if (name === 'identificacion' && normalizedValue !== value) {
            setFormData((prev) => ({
                ...prev,
                identificacion: normalizedValue
            }));
        }

        if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, normalizedValue)
            }));
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '', identificacion: '', direccion: '', celular: '', correo: '', nombreFamiliar: '', direccionFamiliar: '', telefonoFamiliar: '', nombrePersonal: '',
            direccionPersonal: '', telefonoPersonal: ''
        });
        setErrors(initialErrors);
    };

    const handleClose = () => {
        limpiarFormulario();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const normalizedData = {
            ...formData,
            identificacion: formData.identificacion.trim()
        };

        const nextErrors = validateRequiredFields(normalizedData);
        setErrors(nextErrors);

        // Corta el flujo si sigue habiendo errores visibles en pantalla.
        const hasErrors = Object.values(nextErrors).some((error) => error !== '');
        if (hasErrors) return;

        actualizarCliente(
            cliente.id,
            {
                id: cliente.id,
                nombre: formData.nombre.trim(),
                identificacion: normalizedData.identificacion,
                direccion: formData.direccion.trim(),
                celular: formData.celular.trim(),
                correo: formData.correo.trim(),
                nombreFamiliar: formData.nombreFamiliar.trim(),
                direccionFamiliar: formData.direccionFamiliar.trim(),
                telefonoFamiliar: formData.telefonoFamiliar.trim(),
                nombrePersonal: formData.nombrePersonal.trim(),
                direccionPersonal: formData.direccionPersonal.trim(),
                telefonoPersonal: formData.telefonoPersonal.trim()
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
                                Editar <span className={styles.modalTitle2}>Cliente</span>
                            </h5>
                            <button type="button" className={styles.btnClose} onClick={handleClose}>
                                x
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <label className={styles.labelFormu}>
                                        <input
                                            className={`${styles.inputFormu} ${errors.nombre ? styles.inputError : ''}`}
                                            name="nombre"
                                            type="text"
                                            placeholder="Nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.nombre && <span className={styles.fieldError}>{errors.nombre}</span>}
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={`${styles.inputFormu} ${errors.identificacion ? styles.inputError : ''}`}
                                            name="identificacion"
                                            type="text"
                                            placeholder="Identificacion"
                                            value={formData.identificacion}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.identificacion && <span className={styles.fieldError}>{errors.identificacion}</span>}
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={`${styles.inputFormu} ${errors.direccion ? styles.inputError : ''}`}
                                            name="direccion"
                                            type="text"
                                            placeholder="Direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.direccion && <span className={styles.fieldError}>{errors.direccion}</span>}
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={`${styles.inputFormu} ${errors.celular ? styles.inputError : ''}`}
                                            name="celular"
                                            type="text"
                                            placeholder="Celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.celular && <span className={styles.fieldError}>{errors.celular}</span>}
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="correo"
                                            type="text"
                                            placeholder="Correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="nombreFamiliar"
                                            type="text"
                                            placeholder="Nombre del Familiar"
                                            value={formData.nombreFamiliar}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="direccionFamiliar"
                                            type="text"
                                            placeholder="Direccion del Familiar"
                                            value={formData.direccionFamiliar}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="telefonoFamiliar"
                                            type="text"
                                            placeholder="Telefono del Familiar"
                                            value={formData.telefonoFamiliar}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="nombrePersonal"
                                            type="text"
                                            placeholder="Nombre de una Referencia Personal"
                                            value={formData.nombrePersonal}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="direccionPersonal"
                                            type="text"
                                            placeholder="Direccion de la Referencia Personal"
                                            value={formData.direccionPersonal}
                                            onChange={handleChange}
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="telefonoPersonal"
                                            type="text"
                                            placeholder="Telefono de la Referencia Personal"
                                            value={formData.telefonoPersonal}
                                            onChange={handleChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={handleClose}
                                >
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

export default Editarcliente;

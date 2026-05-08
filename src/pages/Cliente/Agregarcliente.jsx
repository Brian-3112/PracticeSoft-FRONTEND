import { useState } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import BotonVerde from '../../components/BotonVerde.jsx';
import styles from '../Cliente/cliente.module.css';
import useCliente from '../../hooks/useCliente.jsx';


// Estado inicial del formulario.
const initialFormData = {
    nombre: '', identificacion: '', direccion: '', celular: '', correo: '', nombreFamiliar: '', direccionFamiliar: '', telefonoFamiliar: '',
    nombrePersonal: '', direccionPersonal: '', telefonoPersonal: ''
};

// Estado inicial de errores.
const initialErrors = {
    nombre: '',
    identificacion: '',
    celular: ''
};

const toTitleCaseByWords = (value) =>
    String(value).replace(/\b([a-záéíóúñü])/gi, (letter) => letter.toUpperCase());

// Valida en un solo punto los campos requeridos del formulario.
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

const Agregarcliente = () => {
    // Verifica si el usuario esta autenticado.
    const { loading } = useAuth();

    const { agregarCliente } = useCliente();
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState(initialErrors);
    if (loading) return 'Cargando...';

    // Revalida los campos obligatorios antes de enviar. 
    const validateRequiredFields = (dataToValidate) => {
        return {
            nombre: validateField('nombre', dataToValidate.nombre),
            identificacion: validateField('identificacion', dataToValidate.identificacion),
            celular: validateField('celular', dataToValidate.celular)
        };
    };

    // Validacion en tiempo real mientras el usuario escribe.
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

    // Normaliza identificacion (trim) cuando el usuario sale del input.
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

        // Normaliza identificacion (trim) cuando el usuario sale del input,
        const normalizedData = {
            ...formData,
            identificacion: formData.identificacion.trim()
        };

        // Revalida los campos obligatorios antes de enviar. le pasa el formulario normalizado. 
        const nextErrors = validateRequiredFields(normalizedData);
        setErrors(nextErrors);

        // Si hay errores de validacion, no se envia al backend.
        const hasErrors = Object.values(nextErrors).some((error) => error !== '');
        if (hasErrors) return;

        agregarCliente(
            {
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
        <div>
            <BotonVerde text="Agregar Cliente" onClick={handleShow} />

            {show && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalDialog}>
                            <div className={styles.modalContent}>

                                <div className={styles.modalHeader}>
                                    <h5 className={styles.modalTitle}>Agregar <span className={styles.modalTitle2}>Cliente</span></h5>
                                    <button type="button" className={styles.btnClose} onClick={handleClose}>x</button>
                                </div>

                                <form onSubmit={handleSubmit} noValidate>

                                    <div className={styles.modalBody}>
                                        <div className={styles.formGrid}>
                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="direccion"
                                                        type="text"
                                                        placeholder="Direccion"
                                                        value={formData.direccion}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                </label>
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
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
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="direccionPersonal"
                                                        type="text"
                                                        placeholder="Dirrecion de la Referencia Personal"
                                                        value={formData.direccionPersonal}
                                                        onChange={handleChange}
                                                    />
                                                </label>
                                            </div>

                                            <div>
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

export default Agregarcliente;

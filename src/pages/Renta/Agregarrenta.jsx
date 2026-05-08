import { useState } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import BotonVerde from '../../components/BotonVerde.jsx';
import styles from '../Renta/renta.module.css';
import useRenta from '../../hooks/useRenta.jsx';
import useCliente from '../../hooks/useCliente.jsx';
import useVehiculo from '../../hooks/useVehiculo.jsx';

const initialFormData = {
    vehiculoId: '',
    clienteId: '',
    fechaEntrega: '',
    horaEntrega: '',
    fechaDevolucion: '',
    horaDevolucion: '',
    valorDia: ''
};

const initialErrors = {
    vehiculoId: '',
    clienteId: '',
    fechaEntrega: '',
    horaEntrega: '',
    fechaDevolucion: '',
    horaDevolucion: '',
    valorDia: ''
};

// Reglas de validacion para campos obligatorios de la renta.
const validateField = (name, value) => {
    const trimmedValue = String(value).trim();

    if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
        if (!trimmedValue) return 'Campo obligatorio';
        return '';
    }

    return '';
};

const Agregarrenta = () => {

    const { loading } = useAuth();


    const { agregarRenta, isCreatingRenta, rentas } = useRenta();
    const { clientes } = useCliente();
    const { vehiculos } = useVehiculo();
    if (loading) return 'Cargando...';

    /// Funcionalidad para cerrar el modal
    const [show, setShow] = useState(false);

    // Estado para el formulario Renta
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState(initialErrors);

    const validateRequiredFields = (dataToValidate) => {
        return {
            vehiculoId: validateField('vehiculoId', dataToValidate.vehiculoId),
            clienteId: validateField('clienteId', dataToValidate.clienteId),
            fechaEntrega: validateField('fechaEntrega', dataToValidate.fechaEntrega),
            horaEntrega: validateField('horaEntrega', dataToValidate.horaEntrega),
            fechaDevolucion: validateField('fechaDevolucion', dataToValidate.fechaDevolucion),
            horaDevolucion: validateField('horaDevolucion', dataToValidate.horaDevolucion),
            valorDia: validateField('valorDia', dataToValidate.valorDia)
        };
    };

    const combineDateAndTime = (date, time) => {
        if (!date || !time) return null;
        return new Date(`${date}T${time}`);
    };

    const hasRentaOverlap = (dataToValidate) => {
        const newStart = combineDateAndTime(dataToValidate.fechaEntrega, dataToValidate.horaEntrega);
        const newEnd = combineDateAndTime(dataToValidate.fechaDevolucion, dataToValidate.horaDevolucion);

        if (!newStart || !newEnd) return false;

        return rentas.some((renta) => {
            const rentaVehiculoId = renta.vehiculoId ?? renta.vehiculo?.id;
            if (String(rentaVehiculoId) !== String(dataToValidate.vehiculoId)) return false;

            const existingStart = combineDateAndTime(renta.fechaEntrega, renta.horaEntrega);
            const existingEnd = combineDateAndTime(renta.fechaDevolucion, renta.horaDevolucion);
            if (!existingStart || !existingEnd) return false;

            // Permite que termine exactamente cuando inicia otra renta (sin solape).
            return newStart < existingEnd && newEnd > existingStart;
        });
    };

    const calcularTotalEstimado = () => {
    };

    const totalEstimado = calcularTotalEstimado();

    // Valida en tiempo real mientras el usuario escribe.
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, value)
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

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormData(initialFormData);
        setErrors(initialErrors);
    };


    // Logica cierre modal
    const handleClose = () => { limpiarFormulario(); setShow(false); };
    const handleShow = () => { setShow(true); };



    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const nextErrors = validateRequiredFields(formData);
        setErrors(nextErrors);

        const fechaEntregaDateTime = combineDateAndTime(formData.fechaEntrega, formData.horaEntrega);
        const fechaDevolucionDateTime = combineDateAndTime(formData.fechaDevolucion, formData.horaDevolucion);

        if (fechaEntregaDateTime && fechaDevolucionDateTime && fechaDevolucionDateTime <= fechaEntregaDateTime) {
            nextErrors.horaDevolucion = 'La devolución debe ser posterior a la entrega';
        }

        if (!nextErrors.vehiculoId && hasRentaOverlap(formData)) {
            nextErrors.vehiculoId = 'Horario no disponible para este vehículo';
        }

        setErrors(nextErrors);

        // Si hay errores, no se envia al backend.
        const hasErrors = Object.values(nextErrors).some((error) => error !== '');
        if (hasErrors) return;

        const rentaPayload = {
            vehiculoId: Number.parseInt(formData.vehiculoId, 10),
            clienteId: Number.parseInt(formData.clienteId, 10),
            fechaEntrega: formData.fechaEntrega.trim(),
            horaEntrega: formData.horaEntrega.trim(),
            fechaDevolucion: formData.fechaDevolucion.trim(),
            horaDevolucion: formData.horaDevolucion.trim(),
            valorDia: Number.parseFloat(formData.valorDia),
        };

            rentaPayload,
        );

    };

    return (
        <div>
            <BotonVerde text="Agregar Renta" onClick={handleShow} />

            {show && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalDialog}>
                            <div className={styles.modalContent}>

                                <div className={styles.modalHeader}>
                                    <h5 className={styles.modalTitle}>Agregar <span className={styles.modalTitle2}>Renta</span></h5>
                                    <button type="button" className={styles.btnClose} onClick={handleClose}>x</button>
                                </div>

                                <form onSubmit={handleSubmit} noValidate>

                                    <div className={styles.modalBody}>
                                        <div className={styles.formGrid}>
                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <select
                                                        className={`${styles.inputFormu} ${errors.clienteId ? styles.inputError : ''}`}
                                                        name="clienteId"
                                                        value={formData.clienteId}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    >
                                                        <option value="">Seleccione un Cliente</option>
                                                        {clientes.map((cliente) => (
                                                            <option key={cliente.id} value={cliente.id}>
                                                                {cliente.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.clienteId && <span className={styles.fieldError}>{errors.clienteId}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <select
                                                        className={`${styles.inputFormu} ${errors.vehiculoId ? styles.inputError : ''}`}
                                                        name="vehiculoId"
                                                        value={formData.vehiculoId}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    >
                                                        <option value="">Seleccione un Vehiculo</option>
                                                        {vehiculos.map((vehiculo) => (
                                                            <option key={vehiculo.id} value={vehiculo.id}>
                                                                {vehiculo.nombreVehiculo}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.vehiculoId && <span className={styles.fieldError}>{errors.vehiculoId}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={`${styles.inputFormu} ${errors.fechaEntrega ? styles.inputError : ''}`}
                                                        name="fechaEntrega"
                                                        type="date"
                                                        placeholder="Fecha de Entrega"
                                                        value={formData.fechaEntrega}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.fechaEntrega && <span className={styles.fieldError}>{errors.fechaEntrega}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={`${styles.inputFormu} ${errors.horaEntrega ? styles.inputError : ''}`}
                                                        name="horaEntrega"
                                                        type="time"
                                                        placeholder="Hora de Entrega"
                                                        value={formData.horaEntrega}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.horaEntrega && <span className={styles.fieldError}>{errors.horaEntrega}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={`${styles.inputFormu} ${errors.fechaDevolucion ? styles.inputError : ''}`}
                                                        name="fechaDevolucion"
                                                        type="date"
                                                        placeholder="Fecha de Devolucion"
                                                        value={formData.fechaDevolucion}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.fechaDevolucion && <span className={styles.fieldError}>{errors.fechaDevolucion}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={`${styles.inputFormu} ${errors.horaDevolucion ? styles.inputError : ''}`}
                                                        name="horaDevolucion"
                                                        type="time"
                                                        placeholder="Hora de Devolucion"
                                                        value={formData.horaDevolucion}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.horaDevolucion && <span className={styles.fieldError}>{errors.horaDevolucion}</span>}
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={`${styles.inputFormu} ${errors.valorDia ? styles.inputError : ''}`}
                                                        name="valorDia"
                                                        type="text"
                                                        placeholder="Valor por Dia"
                                                        value={formData.valorDia}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                    {errors.valorDia && <span className={styles.fieldError}>{errors.valorDia}</span>}
                                                </label>
                                            </div>

                                            <div className={styles.totalPreviewContainer}>
                                                <span className={styles.totalPreviewInline}>
                                                    {totalEstimado.toLocaleString('es-CO', {
                                                        style: 'currency',
                                                        currency: 'COP',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0
                                                    })}
                                                </span>
                                            </div>

                                        </div>
                                    </div>



                                    <div className={styles.modalFooter}>
                                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isCreatingRenta}>
                                            {isCreatingRenta ? 'Guardando...' : 'Guardar'}
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

export default Agregarrenta;

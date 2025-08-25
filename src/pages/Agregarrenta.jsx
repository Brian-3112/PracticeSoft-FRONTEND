import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.jsx';
import BotonVerde from '../components/BotonVerde.jsx';
import styles from '../pages/renta.module.css';
import useRenta from '../hooks/useRenta.jsx';
import useCliente from '../hooks/useCliente.jsx';
import useVehiculo from '../hooks/useVehiculo.jsx';
import { useForm } from 'react-hook-form';


const Agregarrenta = () => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    const { agregarRenta, rentas } = useRenta();
    const { clientes } = useCliente();
    const { vehiculos } = useVehiculo();

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


    // Estado para el formulario Renta
    const [formData, setFormData] = useState({
        vehiculoId: '', clienteId: '', fechaEntrega: '', horaEntrega: '', fechaDevolucion: '', horaDevolucion: '', numeroDias: '', valorDia: '',
        valorTotal: ''
    });


    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormData({
            vehiculoId: '', clienteId: '', fechaEntrega: '', horaEntrega: '', fechaDevolucion: '', horaDevolucion: '', numeroDias: '', valorDia: '',
            valorTotal: ''
        });
    };


    // Logica cierre modal
    const handleClose = () => { limpiarFormulario(); setShow(false); };
    const handleShow = () => { setShow(true); };

    

    // Enviar formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        agregarRenta(
            {
                vehiculoId: parseInt(formData.vehiculoId),   // lo convertimos a número
                clienteId: parseInt(formData.clienteId),
                fechaEntrega: formData.fechaEntrega.trim(),
                horaEntrega: formData.horaEntrega.trim(),
                fechaDevolucion: formData.fechaDevolucion.trim(),
                horaDevolucion: formData.horaDevolucion.trim(),
                numeroDias: parseInt(formData.numeroDias),
                valorDia: parseFloat(formData.valorDia),
                valorTotal: parseFloat(formData.valorTotal)
            },
            () => {
                limpiarFormulario();
                handleClose();
            }
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
                                    <h5 className={styles.modalTitle}>Agregar <span className={styles.modalTitle2}>Cliente</span></h5>
                                    <button type="button" className={styles.btnClose} onClick={handleClose}>×</button>
                                </div>

                                <form onSubmit={handleSubmit} >

                                    <div className={styles.modalBody}>
                                        <div className={styles.formGrid}>
                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <select
                                                        className={styles.inputFormu}
                                                        name="clienteId"
                                                        value={formData.clienteId}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione un cliente</option>
                                                        {clientes.map((cliente) => (
                                                            <option key={cliente.id} value={cliente.id}>
                                                                {cliente.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <select
                                                        className={styles.inputFormu}
                                                        name="vehiculoId"
                                                        value={formData.vehiculoId}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Seleccione un Vehiculo</option>
                                                        {vehiculos.map((vehiculo) => (
                                                            <option key={vehiculo.id} value={vehiculo.id}>
                                                                {vehiculo.nombreVehiculo}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="fechaEntrega"
                                                        type="date"
                                                        placeholder="Fecha de Entrega"
                                                        value={formData.fechaEntrega}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="horaEntrega"
                                                        type="time"
                                                        placeholder="Hora de Entrega"
                                                        value={formData.horaEntrega}
                                                        onChange={handleChange}
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="fechaDevolucion"
                                                        type="date"
                                                        placeholder="Fecha de Devolución"
                                                        value={formData.fechaDevolucion}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="horaDevolucion"
                                                        type="time"
                                                        placeholder="Hora de Devolución"
                                                        value={formData.horaDevolucion }
                                                        onChange={handleChange}
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="numeroDias"
                                                        type="text"
                                                        placeholder="Número de Días"
                                                        value={formData.numeroDias}
                                                        onChange={handleChange}
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="valorDia"
                                                        type="text"
                                                        placeholder="Valor por Día"
                                                        value={formData.valorDia}
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

export default Agregarrenta;

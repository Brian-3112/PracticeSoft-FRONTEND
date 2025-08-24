import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.jsx';
import BotonVerde from '../components/BotonVerde.jsx';
import styles from '../pages/renta.module.css';
import useRenta from '../hooks/useRenta.jsx';
import { useForm } from 'react-hook-form';


const Agregarrenta = () => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    const { agregarRenta } = useRenta();

    /// Funcionalidad para cerra el modal
    const [show, setShow] = useState(false);

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

    // Manejar cambios en los inputs, optiene lo que uno va escribienod en los imput, ...formData trae los valores acutales y solo actualice el input que este modificando
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
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="nombre"
                                                        type="text"
                                                        placeholder="nombre"
                                                        value={formData.nombre}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="identificacion"
                                                        type="text"
                                                        placeholder="identificacion"
                                                        value={formData.identificacion}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="direccion"
                                                        type="text"
                                                        placeholder="direccion"
                                                        value={formData.direccion}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="celular"
                                                        type="text"
                                                        placeholder="celular"
                                                        value={formData.celular}
                                                        onChange={handleChange}
                                                    />
                                                </label>
                                            </div>

                                            <div>
                                                <label className={styles.labelFormu}>
                                                    <input
                                                        className={styles.inputFormu}
                                                        name="correo"
                                                        type="text"
                                                        placeholder="correo"
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
                                                        placeholder="Nombre del familiar"
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
                                                        placeholder="Direccion del familiar"
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
                                                        placeholder="Telefono del familiar"
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
                                                        placeholder="Nombre de una referencia personal"
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
                                                        placeholder="Dirrecion de la Referencia personal"
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
                                                        placeholder="Telefono de la Referencia personal"
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

export default Agregarrenta;

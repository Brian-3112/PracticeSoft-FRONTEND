import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.jsx';
import styles from '../pages/cliente.module.css';
import useCliente from '../hooks/useCliente.jsx';



const Editarcliente = ({ cliente, onClose }) => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...'; 

    const { actualizarCliente } = useCliente();

    // Estado para el formulario Cliente
    const [formData, setFormData] = useState({
        nombre: '', identificacion: '', direccion: '', celular: '', correo: '', nombreFamiliar: '', direccionFamiliar: '', telefonoFamiliar: '', nombrePersonal: '',
        direccionPersonal: '', telefonoPersonal: ''
    });

    // Cuando cambia el cliente a editar, actualizamos el formulario
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
        }
    }, [cliente]);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormData({
            nombre: '', identificacion: '', direccion: '', celular: '', correo: '', nombreFamiliar: '', direccionFamiliar: '', telefonoFamiliar: '', nombrePersonal: '',
            direccionPersonal: '', telefonoPersonal: ''
        });
    };

    // Cerrar modal
    const handleClose = () => {
        limpiarFormulario();
        onClose();
    };

    // Enviar formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        actualizarCliente(
            cliente.id,
            {
                id: cliente.id, // importante para actualizar el correcto
                nombre: formData.nombre.trim(),
                identificacion: formData.identificacion.trim(),
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
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGrid}>
                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="nombre"
                                            type="text"
                                            placeholder="Nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="identificacion"
                                            type="text"
                                            placeholder="Identificacion"
                                            value={formData.identificacion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="direccion"
                                            type="text"
                                            placeholder="Direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>

                                    <label className={styles.labelFormu}>
                                        <input
                                            className={styles.inputFormu}
                                            name="celular"
                                            type="text"
                                            placeholder="Celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                        />
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

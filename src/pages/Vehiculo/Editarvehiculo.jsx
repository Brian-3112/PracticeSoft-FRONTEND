import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import styles from '../Vehiculo/vehiculo.module.css';
import useVehiculo from '../../hooks/useVehiculo.jsx';



const Editarvehiculo = ({ vehiculo, onClose }) => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';

    const { actualizarVehiculo } = useVehiculo();

    // Estado para el formulario
    const [formData, setFormData] = useState({
        nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
    });

    // Cuando cambia el cliente a editar, actualizamos el formulario
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
        }
    }, [vehiculo]);

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
            nombreVehiculo: '', placa: '', transito: '', fechaSOAT: '', fechaTecno: '', description: ''
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

        actualizarVehiculo(
            vehiculo.id,
            {
                id: vehiculo.id, // importante para actualizar el correcto
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
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <div className={styles.modalDialog}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>
                                Editar <span className={styles.modalTitle2}>Vehiculo</span>
                            </h5>
                            <button type="button" className={styles.btnClose} onClick={handleClose}>
                                ×
                            </button>
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
    );
};

export default Editarvehiculo;

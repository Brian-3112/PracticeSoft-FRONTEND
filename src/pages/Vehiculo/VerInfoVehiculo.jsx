import useAuth from '../../hooks/useAuth.jsx';
import styles from '../Vehiculo/vehiculo.module.css';



const VerInfoVehiculo = ({ vehiculo, onClose }) => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    if (!vehiculo) return null;



    return (
        <div>
            {/* <BotonVerde text="Agregar Cliente" onClick={handleShow} /> */}


            <div className={styles.modalBackdrop}>
                <div className={styles.modal}>
                    <div className={styles.modalDialog}>
                        <div className={styles.modalContent}>

                            <div className={styles.modalHeader}>
                                <h5 className={styles.modalTitle}>Informacion del <span className={styles.modalTitle2}>Vehiculo</span></h5>
                                <button type="button" className={styles.btnClose} onClick={onClose}>×</button>
                            </div>

                            <form  >

                                <div className={styles.modalBody}>
                                    <div className={styles.formGrid}>
                                        <div>
                                            <label className={styles.labelFormuu}> <p>Transito</p>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="transito"
                                                    type="text"
                                                    placeholder="Transito"
                                                    value={vehiculo.transito}
                                                    readOnly

                                                />
                                            </label>
                                        </div>

                                        <div>
                                            <label className={styles.labelFormuu}><p>Descripcion del Vehiculo</p>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="description"
                                                    type="text"
                                                    placeholder="Descripcion del Vehiculo"
                                                    value={vehiculo.description}
                                                    readOnly

                                                />
                                            </label>
                                        </div>

                                                                               
                                    </div>
                                </div>


                                <div className={styles.modalFooter}>
                                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                                        Cerrar
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerInfoVehiculo;

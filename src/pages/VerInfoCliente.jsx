import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.jsx';
import BotonVerde from '../components/BotonVerde.jsx';
import styles from '../pages/cliente.module.css';
import useCliente from '../hooks/useCliente.jsx';
import { useForm } from 'react-hook-form';


const VerInfoCliente = ({ cliente, onClose }) => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    if (!cliente) return null;


    const { agregarCliente } = useCliente();

    /// Funcionalidad para cerra el modal
    const [show, setShow] = useState(false);




    // Logica cierre modal
    const handleClose = () => { setShow(false); };
    const handleShow = () => { setShow(true); };



    return (
        <div>
            {/* <BotonVerde text="Agregar Cliente" onClick={handleShow} /> */}


            <div className={styles.modalBackdrop}>
                <div className={styles.modal}>
                    <div className={styles.modalDialog}>
                        <div className={styles.modalContent}>

                            <div className={styles.modalHeader}>
                                <h5 className={styles.modalTitle}>Informacion del <span className={styles.modalTitle2}>Cliente</span></h5>
                                <button type="button" className={styles.btnClose} onClick={onClose}>×</button>
                            </div>

                            <form  >

                                <div className={styles.modalBody}>
                                    <div className={styles.formGrid}>
                                        {/* <div>
                                            <label className={styles.labelFormu}>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="nombre"
                                                    type="text"
                                                    placeholder="Nombre"
                                                    value={cliente.nombre}
                                                    readOnly
                                                />
                                            </label>
                                        </div>

                                        <div>
                                            <label className={styles.labelFormu}>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="identificacion"
                                                    type="text"
                                                    placeholder="Identificacion"
                                                    value={cliente.identificacion}
                                                    readOnly

                                                />
                                            </label>
                                        </div> */}

                                        {/* <div>
                                            <label className={styles.labelFormu}>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="direccion"
                                                    type="text"
                                                    placeholder="Direccion"
                                                    value={cliente.direccion}
                                                    readOnly

                                                />
                                            </label>
                                        </div>

                                        <div>
                                            <label className={styles.labelFormu}>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="celular"
                                                    type="text"
                                                    placeholder="Celular"
                                                    value={cliente.celular}
                                                    readOnly

                                                />
                                            </label>
                                        </div> */}

                                        <div>
                                            <label className={styles.labelFormu}>
                                                <input
                                                    className={styles.inputFormu}
                                                    name="correo"
                                                    type="text"
                                                    placeholder="Correo"
                                                    value={cliente.correo}
                                                    readOnly

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
                                                    value={cliente.nombreFamiliar}
                                                    readOnly

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
                                                    value={cliente.direccionFamiliar}
                                                    readOnly

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
                                                    value={cliente.telefonoFamiliar}
                                                    readOnly

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
                                                    value={cliente.nombrePersonal}
                                                    readOnly

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
                                                    value={cliente.direccionPersonal}
                                                    readOnly

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
                                                    value={cliente.telefonoPersonal}
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
                                    {/* <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                            Guardar
                                        </button> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerInfoCliente;

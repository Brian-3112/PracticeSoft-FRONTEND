import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useRenta from '../hooks/useRenta.jsx';
import styles from '../pages/renta.module.css';
import useAuth from '../hooks/useAuth';



const Renta = () => {

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    const { rentas } = useRenta();





    return (


        <div className={styles.wrapper}>
            <h2 className={styles.heading}>CLIENTES</h2>

            {/* <div className={styles.divAddVehiculo}>
                <Agregarcliente />
            </div> */}


        </div>













    );
};

export default Renta;

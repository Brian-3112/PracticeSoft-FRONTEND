import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useVehiculo from '../hooks/useVehiculo.jsx'
import styles from '../pages/vehiculo.module.css';


const Vehiculo = () => {

    /// extrayendo la información para la autenticación
    const { auth, loading } = useAuth();
    if (loading == true) return 'Cargando...';


    const vehiculoData = useVehiculo();
    const vehiculos = vehiculoData?.vehiculos || [];




    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>VEHICULOS</h2>

            {vehiculos.length === 0 ? (
                <p>No hay vehículos disponibles.</p>
            ) : (
                vehiculos.map((vehiculo) => (
                    <div className={styles.card} key={vehiculo.id}>
                        {/* <img src="/car2.svg" alt="Icono de carro" className={styles.carImage} /> */}
                        <p className={styles.cookieHeading}>{vehiculo.nombreVehiculo}</p>
                        <p className={styles.cookieDescription}>Placa: {vehiculo.placa}</p>
                        <p className={styles.cookieDescription}>Tránsito: {vehiculo.transito}</p>

                        <div className={styles.buttonContainer}>
                            <button className={styles.acceptButton}>Editar</button>
                            <button className={styles.declineButton}>Eliminar</button>
                        </div>

                    </div>
                ))
            )}
        </div>
    );
};


export default Vehiculo;

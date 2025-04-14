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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            <h2 style={{ width: '100%', textAlign: 'center' }}>Carros</h2>

            {vehiculos.length === 0 ? (
                <p>No hay vehículos disponibles.</p>
            ) : (
                vehiculos.map((vehiculo) => (
                    <div className={styles.card} key={vehiculo.id}>
                        <p className={styles.cookieHeading}>{vehiculo.nombreVehiculo}</p>
                        <p className={styles.cookieDescription}>Placa: {vehiculo.placa}</p>
                        <p className={styles.cookieDescription}>Tránsito: {vehiculo.transito}</p>
                    </div>
                ))
            )}
        </div>
    );
};


export default Vehiculo;

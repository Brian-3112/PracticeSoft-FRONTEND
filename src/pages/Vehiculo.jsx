import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useVehiculo from '../hooks/useVehiculo.jsx'


const Vehiculo = () => {

    /// extrayendo la información para la autenticación
    const { auth, loading } = useAuth();
    if (loading == true) return 'Cargando...';


    const vehiculoData = useVehiculo();
    const vehiculos = vehiculoData?.vehiculos || [];







    return (
        <div>
            <h2>Carros</h2>

            {vehiculos.length === 0 ? (
                <p>No hay vehículos disponibles.</p>
            ) : (
                <ul>
                    {vehiculos.map((vehiculo) => (
                        <li key={vehiculo.id}>
                            <h3>{vehiculo.nombreVehiculo}</h3>
                            <p>Placa: {vehiculo.placa}</p>
                            <p>Tránsito: {vehiculo.transito}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default Vehiculo;

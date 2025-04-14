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
                        <li key={vehiculo._id}>
                            <h3>{vehiculo.nombre}</h3>
                            <p>Marca: {vehiculo.marca}</p>
                            <p>Modelo: {vehiculo.modelo}</p>
                            <p>Precio: {vehiculo.precio}</p>
                            {/* Agrega más campos si necesitas */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default Vehiculo;

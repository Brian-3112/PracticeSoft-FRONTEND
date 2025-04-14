import { useContext } from 'react';
import { VehiculoContext } from '../context/VehiculoProvider'; // ← ajusta la importación

const useVehiculo = () => {
    return useContext(VehiculoContext);
};

export default useVehiculo;

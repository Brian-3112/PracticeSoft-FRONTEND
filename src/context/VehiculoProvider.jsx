import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

const VehiculoContext = createContext();

const VehiculoProvider = ({ children }) => {

    const { config, auth } = useAuth();

    // primer state
    const [vehiculos, setVehiculos] = useState([]);

    const consultarVehiculos = async () => {


        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.get('/vehiculos', config);

            setVehiculos(data.reverse());
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al consultar los proveedores. Vuelva a intentarlo.',
                icon: 'error',
            });
        }
    };
    useEffect(() => {
        consultarVehiculos();
    }, [auth]);







    return (
        <VehiculoContext.Provider value={{vehiculos}}>
            {children}
        </VehiculoContext.Provider>
    );
};


export { VehiculoProvider };
export default VehiculoContext;

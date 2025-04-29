import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

export const VehiculoContext = createContext(); // <-- cambia esto

export const VehiculoProvider = ({ children }) => {

    const { auth, config } = useAuth();

    //se guarda la info de los vehiculosque se trae del cosultar
    const [vehiculos, setVehiculos] = useState([]);



    const consultarVehiculos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.get('/vehiculos', config);
            setVehiculos(data.reverse());

        } catch (error) {
            console.error('Error al consultar vehículos:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al consultar los vehículos. Vuelva a intentarlo.',
                icon: 'error',
            });
        }
    };
    useEffect(() => {
        if (auth) {
            consultarVehiculos();
        }
    }, [auth]);









    return (
        <VehiculoContext.Provider value={{ vehiculos }}>
            {children}
        </VehiculoContext.Provider>
    );
};



VehiculoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

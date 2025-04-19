import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

export const ClienteContext = createContext(); // <-- cambia esto

export const ClienteProvider = ({ children }) => {
    const { auth, config } = useAuth();

    const [clientes, setClientes] = useState([]);


    const consultarClientes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;


            const { data } = await clienteAxios.get('/clientes', config);

            setClientes(data.reverse());
        } catch (error) {
            console.error('Error al consultar los  clientes:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al consultar los clientes. Vuelva a intentarlo.',
                icon: 'error',
            });
        }
    };


    useEffect(() => {
        if (auth) {
            consultarClientes();
        }
    }, [auth]);



    return (
        <ClienteContext.Provider value={{ clientes }}>
            {children}
        </ClienteContext.Provider>
    );
};

ClienteProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

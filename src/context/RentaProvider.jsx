import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';



export const RentaContext = createContext();

export const RentaProvider = ({ children }) => {
    const { auth, config } = useAuth();

    const [rentas, setRentas] = useState([]);


    const consultarRentas = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.get('/rentas', config);
            setRentas(data.reverse());

        } catch (error) {
            console.error('Error al consultar la Renta:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al consultar las Rentas. Vuelva a intentarlo.',
                icon: 'error',
            });
        }
    };
    useEffect(() => {
        if (auth) {
            consultarRentas();
        }
    }, [auth]);








    return (
        <RentaContext.Provider value={{ rentas }}>
            {children}
        </RentaContext.Provider>
    );
};



RentaProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

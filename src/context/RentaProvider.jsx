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


    const agregarRenta = async (nuevaRenta, handleClose) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.post('/rentas', nuevaRenta, config);
            setRentas(prev => [data.renta, ...prev]);

            Swal.fire({
                title: 'Éxito',
                text: data.message,
                icon: 'success',
            }).then(() => {
                handleClose();
            });

        } catch (error) {

            if (error.response) {

                Swal.fire({
                    title: 'Error',
                    text: error.response.data.message,
                    icon: 'error',
                });

            }
        }
    };




















    return (
        <RentaContext.Provider value={{ rentas, agregarRenta }}>
            {children}
        </RentaContext.Provider>
    );
};



RentaProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

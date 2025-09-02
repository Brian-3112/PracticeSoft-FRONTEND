import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';



export const ClienteContext = createContext();

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


    const agregarCliente = async (nuevoCliente, handleClose) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.post('/clientes', nuevoCliente, config);
            setClientes(prev => [data.cliente, ...prev]);

            Swal.fire({
                title: 'Éxito',
                text: data.message,
                icon: 'success',
            }).then(() => {
                handleClose();
            });

        } catch (error) {

            if (error.response && error.response.status === 403) {

                Swal.fire({
                    title: 'Error',
                    text: error.response.data.message,
                    icon: 'error',
                });

            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo agregar el cliente.',
                    icon: 'error',
                });
            }
        }
    };


    const actualizarCliente = async (id, datosActualizados, handleClose) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.patch(`/clientes/${id}`, datosActualizados, config);
            // Actualizar el estado local reemplazando el cliente modificado
            setClientes(prevClientes =>
                prevClientes.map(cliente =>
                    cliente.id === id ? { ...cliente, ...data } : cliente
                )
            );

            Swal.fire({
                title: 'Éxito',
                text: data.message || 'Cliente actualizado correctamente.',
                icon: 'success',
            }).then(() => {
                handleClose();
                consultarClientes();
            });

        } catch (error) {
            console.error('Error al actualizar cliente:', error);

            if (error.response && error.response.status === 403) {
                Swal.fire({
                    title: 'Error',
                    text: error.response.data.message,
                    icon: 'error',
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo actualizar el cliente.',
                    icon: 'error',
                });
            }
        }
    };


    const eliminarCliente = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const resultado = await Swal.fire({
                title: '¿Estás seguro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Si, eliminar',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: "confirmarBoton",
                    cancelButton: 'cancelBoton'
                }
            });

            if (resultado.isConfirmed) {
                await clienteAxios.delete(`/clientes/${id}`, config);

                setClientes(prevClientes =>
                    prevClientes.filter(cliente => cliente.id !== id)
                );

                Swal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    customClass: {
                        confirmButton: "confirmarBoton",
                        cancelButton: 'cancelBoton'
                    }
                });
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);

            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el cliente.',
                icon: 'error',
            });
        }
    };



    return (
        <ClienteContext.Provider value={{ clientes, agregarCliente, actualizarCliente, eliminarCliente }}>
            {children}
        </ClienteContext.Provider>
    );
};

ClienteProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';



export const VehiculoContext = createContext();

export const VehiculoProvider = ({ children }) => {


    const { auth, config } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [rentas, setRentas] = useState([]);


    //funcion para ver que vehiculos estas disponibles
    useEffect(() => {
        const obtenerRentas = async () => {
            try {
                const { data } = await clienteAxios.get("/rentas", config);
                setRentas(data);
            } catch (error) {
                console.error("Error cargando rentas", error);
            }
        };
        obtenerRentas();
    }, []);






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



    const agregarVehiculo = async (nuevoVehiculo, handleClose) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.post('/vehiculos', nuevoVehiculo, config);
            setVehiculos(prev => [data.vehiculo, ...prev]);

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
                    text: 'No se pudo agregar el vehículo.',
                    icon: 'error',
                });
            }
        }
    };


    const actualizarVehiculo = async (id, datosActualizados, handleClose) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.patch(`/vehiculos/${id}`, datosActualizados, config);

            setVehiculos(prevVehiculos =>
                prevVehiculos.map(vehiculo => //recorre cada vehiculo en el array prevVehiculos
                    vehiculo.id === id ? { ...vehiculo, ...data } : vehiculo  //si el id del vehiculo coincide con el id ques se paso, actualiza los datos del vehiculo y 
                    // añades los datos recibidos del servidor (data
                )
            );

            Swal.fire({
                title: 'Éxito',
                text: data.message || 'Vehiculo actualizado correctamente.',
                icon: 'success',
            }).then(() => {
                handleClose();
                consultarVehiculos();
            });

        } catch (error) {
            console.error('Error al actualizar el vehiculo:', error);

            if (error.response && error.response.status === 403) {
                Swal.fire({
                    title: 'Error',
                    text: error.response.data.message,
                    icon: 'error',
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo actualizar el vehiculo.',
                    icon: 'error',
                });
            }
        }
    };


    const eliminarVehiculo = async (id) => {
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
                await clienteAxios.delete(`/vehiculos/${id}`, config);

                setVehiculos(prevVehiculos =>
                    prevVehiculos.filter(vehiculo => vehiculo.id !== id)
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
            console.error('Error al eliminar vehículo:', error);

            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el vehículo.',
                icon: 'error',
            });
        }
    };








    return (
        <VehiculoContext.Provider value={{ vehiculos, agregarVehiculo, actualizarVehiculo, eliminarVehiculo, rentas }}>
            {children}
        </VehiculoContext.Provider>
    );
};



VehiculoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';


export const VehiculoContext = createContext();


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




    const agregarVehiculo = async (nuevoVehiculo) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const { data } = await clienteAxios.post('/vehiculos', nuevoVehiculo, config);
            setVehiculos(prev => [data, ...prev]);  // Agrega al principio de la lista

            Swal.fire({
                title: 'Éxito',
                text: data.data.message,
                icon: 'success',
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


    const eliminarVehiculo = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const resultado = await Swal.fire({
                title: '¿Estás seguro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
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
        <VehiculoContext.Provider value={{ vehiculos, agregarVehiculo, eliminarVehiculo }}>
            {children}
        </VehiculoContext.Provider>
    );
};



VehiculoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

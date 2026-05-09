import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { createRenta, deleteRentaById, downloadContratoDocx } from '../services/rentaService';
import { VehiculoContext } from './VehiculoProvider';
import { DashboardContext } from './DashboardProvider';



export const RentaContext = createContext();

export const RentaProvider = ({ children }) => {
    const { auth, config } = useAuth();
    const vehiculoContext = useContext(VehiculoContext);
    const dashboardContext = useContext(DashboardContext);

    const [rentas, setRentas] = useState([]);
    const [isCreatingRenta, setIsCreatingRenta] = useState(false);
    const [isDownloadingContrato, setIsDownloadingContrato] = useState(false);
    const [downloadingRentaId, setDownloadingRentaId] = useState(null);
    const [lastCreatedRentaId, setLastCreatedRentaId] = useState(null);
    const [isDeletingRenta, setIsDeletingRenta] = useState(false);
    const [deletingRentaId, setDeletingRentaId] = useState(null);


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
            setIsCreatingRenta(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const data = await createRenta({ rentaPayload: nuevaRenta, config });
            setRentas(prev => [data.renta, ...prev]);
            setLastCreatedRentaId(data?.renta?.id ?? null);

            await Promise.all([
                vehiculoContext?.consultarVehiculos?.(),
                vehiculoContext?.consultarRentas?.(),
                dashboardContext?.calcularDashboard?.(),
            ]);

            await Swal.fire({
                title: 'Éxito',
                text: data.message,
                icon: 'success',
            });
            handleClose();

        } catch (error) {

            if (error.response) {

                Swal.fire({
                    title: 'Error',
                    text: error.response.data.message || 'No fue posible crear la renta.',
                    icon: 'error',
                });

            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No fue posible crear la renta. Intenta nuevamente.',
                    icon: 'error',
                });
            }
        } finally {
            setIsCreatingRenta(false);
        }
    };


    const eliminarRenta = async (rentaId) => {
        const rentaIdNumerica = Number(rentaId);
        if (!rentaIdNumerica) return false;

        const confirmacion = await Swal.fire({
            title: '¿Eliminar renta?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'confirmarBoton',
                cancelButton: 'cancelBoton',
            },
        });

        if (!confirmacion.isConfirmed) return false;

        setIsDeletingRenta(true);
        setDeletingRentaId(rentaIdNumerica);

        try {
            const response = await deleteRentaById({ rentaId: rentaIdNumerica, config });
            setRentas((prev) => prev.filter((renta) => renta.id !== rentaIdNumerica));

            await Promise.all([
                vehiculoContext?.consultarVehiculos?.(),
                vehiculoContext?.consultarRentas?.(),
                dashboardContext?.calcularDashboard?.(),
            ]);

            await Swal.fire({
                title: 'Renta eliminada',
                text: response?.message || 'La renta se eliminó correctamente.',
                icon: 'success',
                customClass: {
                    confirmButton: 'confirmarBoton',
                    cancelButton: 'cancelBoton',
                },
            });
            return true;
        } catch (error) {
            Swal.fire({
                title: 'No se pudo eliminar',
                text: error?.response?.data?.message || 'Intenta nuevamente.',
                icon: 'error',
            });
            return false;
        } finally {
            setIsDeletingRenta(false);
            setDeletingRentaId(null);
        }
    };


    const descargarContrato = async ({ rentaId, rentaPayload, sinDatosCliente = false } = {}) => {
        setIsDownloadingContrato(true);
        setDownloadingRentaId(rentaId || rentaPayload?.id || null);
        try {
            const blobData = await downloadContratoDocx({
                rentaId,
                rentaPayload,
                config,
                sinDatosCliente,
            });

            const rentaIdFromPayload = rentaPayload?.id || rentaId || lastCreatedRentaId || 'sin-id';
            const blob = blobData instanceof Blob
                ? blobData
                : new Blob([blobData], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filePrefix = sinDatosCliente ? 'contrato-vacio-renta' : 'contrato-renta';
            link.setAttribute('download', `${filePrefix}-${rentaIdFromPayload}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch {
            const selectedRentaId = rentaId || rentaPayload?.id || null;
            Swal.fire({
                title: 'Advertencia',
                text: selectedRentaId && selectedRentaId === lastCreatedRentaId
                    ? 'Renta creada, pero no se pudo descargar el contrato'
                    : sinDatosCliente
                        ? 'No se pudo descargar el contrato vacío. Verifica que el backend tenga habilitado el documento sin datos del cliente.'
                        : 'No se pudo descargar el contrato',
                icon: 'warning',
            });
            return false;
        } finally {
            setIsDownloadingContrato(false);
            setDownloadingRentaId(null);
        }
    };




    return (
        <RentaContext.Provider
            value={{
                rentas,
                agregarRenta,
                descargarContrato,
                isCreatingRenta,
                isDownloadingContrato,
                downloadingRentaId,
                lastCreatedRentaId,
                eliminarRenta,
                isDeletingRenta,
                deletingRentaId,
            }}
        >
            {children}
        </RentaContext.Provider>
    );
};



RentaProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

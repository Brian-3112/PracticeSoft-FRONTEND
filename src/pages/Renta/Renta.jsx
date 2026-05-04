import useRenta from '../../hooks/useRenta.jsx';
import styles from '../Renta/renta.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarrenta from '../Renta/Agregarrenta.jsx';
import { useSearchParams } from 'react-router-dom';



const Renta = () => {
    const parseDateOnly = (dateValue) => {
        if (!dateValue) return null;
        const dateString = String(dateValue).slice(0, 10);
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDateOnly = (dateValue) => {
        if (!dateValue) return '';
        const dateString = String(dateValue).slice(0, 10);
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const { loading } = useAuth();


    const { rentas, descargarContrato, isDownloadingContrato, downloadingRentaId } = useRenta();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') ?? '').trim().toLowerCase();

    const rentasFiltradas = !query
        ? rentas
        : rentas.filter((renta) => {
            const nombreCliente = String(renta.cliente?.nombre ?? '').toLowerCase();
            const nombreVehiculo = String(renta.vehiculo?.nombreVehiculo ?? '').toLowerCase();
            const placaVehiculo = String(renta.vehiculo?.placa ?? '').toLowerCase();
            return nombreCliente.includes(query) || nombreVehiculo.includes(query) || placaVehiculo.includes(query);
        });
    const handleDownloadContrato = async (rentaId) => {
        await descargarContrato({ rentaId });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (loading) return 'Cargando...';







    return (


        <div className={styles.wrapper}>

            <div className={styles.divAddVehiculo}>
                <Agregarrenta />
            </div>


            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Placa</th>
                            <th>Entrega</th>
                            <th>Devolución</th>
                            <th>Valor Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentasFiltradas.map((renta) => (
                            <tr key={renta.id}>
                                {(() => {
                                    const fechaEntrega = parseDateOnly(renta.fechaEntrega);
                                    const fechaDevolucion = parseDateOnly(renta.fechaDevolucion);
                                    const isPending = fechaEntrega && today < fechaEntrega;
                                    const isActive = fechaEntrega && fechaDevolucion && today >= fechaEntrega && today <= fechaDevolucion;
                                    const estadoClase = isPending
                                        ? styles.pending
                                        : isActive
                                            ? styles.active
                                            : styles.finished;
                                    const estadoTexto = isPending
                                        ? "Pendiente"
                                        : isActive
                                            ? "En curso"
                                            : "Finalizada";

                                    return (
                                        <>
                                <td>{renta.cliente?.nombre}</td>
                                <td>{renta.vehiculo?.nombreVehiculo}</td>
                                <td>{renta.vehiculo?.placa}</td>
                                <td>{formatDateOnly(renta.fechaEntrega)}</td>
                                <td>{formatDateOnly(renta.fechaDevolucion)}</td>
                                <td>
                                    {renta.valorTotal.toLocaleString("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    })}
                                </td>
                                <td>
                                    <span
                                        className={`${styles.status} ${estadoClase}`}
                                    >
                                        {estadoTexto}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className={styles.downloadButton}
                                        onClick={() => handleDownloadContrato(renta.id)}
                                        disabled={isDownloadingContrato}
                                    >
                                        {isDownloadingContrato && downloadingRentaId === renta.id
                                            ? 'Descargando...'
                                            : 'Descargar contrato'}
                                    </button>
                                </td>
                                        </>
                                    );
                                })()}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>













        </div>

    );
};

export default Renta;

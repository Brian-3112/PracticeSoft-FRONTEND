import useRenta from '../../hooks/useRenta.jsx';
import styles from '../Renta/renta.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarrenta from '../Renta/Agregarrenta.jsx';
import { useSearchParams } from 'react-router-dom';



const normalizeSearchText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const MONTH_SEARCH_TERMS = [
    { month: 0, terms: ['enero', 'ene'] },
    { month: 1, terms: ['febrero', 'feb', 'febereto', 'feberero', 'febrerro'] },
    { month: 2, terms: ['marzo', 'mar'] },
    { month: 3, terms: ['abril', 'abr'] },
    { month: 4, terms: ['mayo', 'may'] },
    { month: 5, terms: ['junio', 'jun'] },
    { month: 6, terms: ['julio', 'jul'] },
    { month: 7, terms: ['agosto', 'ago'] },
    { month: 8, terms: ['septiembre', 'setiembre', 'sep', 'set'] },
    { month: 9, terms: ['octubre', 'oct'] },
    { month: 10, terms: ['noviembre', 'nov'] },
    { month: 11, terms: ['diciembre', 'dic'] },
];

const getMonthFromQuery = (query) => {
    const queryTokens = new Set(query.split(/\s+/).filter(Boolean));

    return MONTH_SEARCH_TERMS.find(({ terms }) => (
        terms.some((term) => queryTokens.has(term))
    ))?.month;
};

const isMonthBetweenDates = (month, startDate, endDate) => {
    if (!startDate && !endDate) return false;
    if (!startDate) return endDate.getMonth() === month;
    if (!endDate) return startDate.getMonth() === month;

    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= lastMonth) {
        if (cursor.getMonth() === month) return true;
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return false;
};

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
    const query = normalizeSearchText(searchParams.get('q') ?? '');
    const selectedMonth = getMonthFromQuery(query);

    const rentasFiltradas = !query
        ? rentas
        : rentas.filter((renta) => {
            const nombreCliente = normalizeSearchText(renta.cliente?.nombre ?? '');
            const nombreVehiculo = normalizeSearchText(renta.vehiculo?.nombreVehiculo ?? '');
            const placaVehiculo = normalizeSearchText(renta.vehiculo?.placa ?? '');
            const fechaEntrega = parseDateOnly(renta.fechaEntrega);
            const fechaDevolucion = parseDateOnly(renta.fechaDevolucion);
            const coincideTexto = nombreCliente.includes(query)
                || nombreVehiculo.includes(query)
                || placaVehiculo.includes(query);
            const coincideMes = selectedMonth !== undefined
                && isMonthBetweenDates(selectedMonth, fechaEntrega, fechaDevolucion);

            return coincideTexto || coincideMes;
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

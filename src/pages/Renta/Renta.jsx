import useRenta from '../../hooks/useRenta.jsx';
import styles from '../Renta/renta.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarrenta from '../Renta/Agregarrenta.jsx';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';



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

const getMonthByTerm = (termToSearch) => MONTH_SEARCH_TERMS.find(({ terms }) => (
    terms.includes(termToSearch)
))?.month;

const normalizeYear = (yearValue) => {
    if (!yearValue) return undefined;
    const year = Number(yearValue);
    if (yearValue.length === 2) return 2000 + year;
    return year;
};

const isValidDateParts = ({ day, month, year }) => {
    if (!Number.isInteger(day) || !Number.isInteger(month)) return false;
    if (day < 1 || month < 0 || month > 11) return false;

    const validationYear = year ?? 2024;
    const date = new Date(validationYear, month, day);
    return date.getFullYear() === validationYear
        && date.getMonth() === month
        && date.getDate() === day;
};

const getDateFromQuery = (query) => {
    const isoDateMatch = query.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (isoDateMatch) {
        const [, yearValue, monthValue, dayValue] = isoDateMatch;
        const dateParts = {
            day: Number(dayValue),
            month: Number(monthValue) - 1,
            year: normalizeYear(yearValue),
        };

        return isValidDateParts(dateParts) ? dateParts : undefined;
    }

    const numericDateMatch = query.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
    if (numericDateMatch) {
        const [, dayValue, monthValue, yearValue] = numericDateMatch;
        const dateParts = {
            day: Number(dayValue),
            month: Number(monthValue) - 1,
            year: normalizeYear(yearValue),
        };

        return isValidDateParts(dateParts) ? dateParts : undefined;
    }

    const textDateMatch = query.match(/\b(\d{1,2})(?:\s+de)?\s+([a-z]+)(?:\s+(?:de\s+)?(\d{2,4}))?\b/);
    if (textDateMatch) {
        const [, dayValue, monthTerm, yearValue] = textDateMatch;
        const month = getMonthByTerm(monthTerm);
        const dateParts = {
            day: Number(dayValue),
            month,
            year: normalizeYear(yearValue),
        };

        return isValidDateParts(dateParts) ? dateParts : undefined;
    }

    return undefined;
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

const isSpecificDateBetweenDates = ({ day, month, year }, startDate, endDate) => {
    if (!startDate && !endDate) return false;

    if (!startDate || !endDate) {
        const dateToCompare = startDate ?? endDate;
        return dateToCompare.getDate() === day
            && dateToCompare.getMonth() === month
            && (year === undefined || dateToCompare.getFullYear() === year);
    }

    if (year !== undefined) {
        const searchedDate = new Date(year, month, day);
        return searchedDate >= startDate && searchedDate <= endDate;
    }

    for (let currentYear = startDate.getFullYear(); currentYear <= endDate.getFullYear(); currentYear += 1) {
        const searchedDate = new Date(currentYear, month, day);
        if (searchedDate.getMonth() === month && searchedDate >= startDate && searchedDate <= endDate) {
            return true;
        }
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


    const {
        rentas,
        descargarContrato,
        eliminarRenta,
        isDownloadingContrato,
        downloadingRentaId,
        isDeletingRenta,
        deletingRentaId,
    } = useRenta();
    const [searchParams] = useSearchParams();
    const query = normalizeSearchText(searchParams.get('q') ?? '');
    const selectedMonth = getMonthFromQuery(query);
    const searchedDate = getDateFromQuery(query);

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
            const coincideFecha = searchedDate !== undefined
                && isSpecificDateBetweenDates(searchedDate, fechaEntrega, fechaDevolucion);
            const coincideMes = searchedDate === undefined
                && selectedMonth !== undefined
                && isMonthBetweenDates(selectedMonth, fechaEntrega, fechaDevolucion);

            return coincideTexto || coincideFecha || coincideMes;
        });
    const handleDownloadContrato = async (rentaId) => {
        const result = await Swal.fire({
            title: '¿Qué contrato deseas descargar?',
            text: 'Puedes descargar el contrato con los datos de esta renta o el mismo formato sin datos del cliente.',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Contrato de esta renta',
            denyButtonText: 'Contrato vacío',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'confirmarBoton',
                cancelButton: 'cancelBoton',
            },
        });

        if (result.isConfirmed) {
            await descargarContrato({ rentaId });
            return;
        }

        if (result.isDenied) await descargarContrato({ rentaId, sinDatosCliente: true });
    };

    const handleDeleteRenta = async (rentaId) => {
        await eliminarRenta(rentaId);
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
                            <th>Contrato / Acciones</th>
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
                                <td className={styles.actionsCell}>
                                    <button
                                        type="button"
                                        className={styles.downloadButton}
                                        onClick={() => handleDownloadContrato(renta.id)}
                                        disabled={isDownloadingContrato || isDeletingRenta}
                                        aria-label={`Elegir contrato para la renta ${renta.id}`}
                                        title="Elegir contrato"
                                    >
                                        <span className={styles.downloadIcon} aria-hidden="true">📄</span>
                                        {isDownloadingContrato && downloadingRentaId === renta.id
                                            ? 'Descargando...'
                                            : 'Contrato'}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteRenta(renta.id)}
                                        disabled={isDeletingRenta || isDownloadingContrato}
                                        aria-label={`Eliminar renta ${renta.id}`}
                                        title="Eliminar renta"
                                    >
                                        {isDeletingRenta && deletingRentaId === renta.id ? '...' : '×'}
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

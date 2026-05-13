import { useMemo, useState } from 'react';
import useRenta from '../../hooks/useRenta.jsx';
import styles from '../Renta/renta.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import useCliente from '../../hooks/useCliente.jsx';
import Agregarrenta from '../Renta/Agregarrenta.jsx';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { TIPOS_CONTRATO_RENTA } from '../../services/rentaService.js';



const CONTRATOS_RENTA_SELECT_OPTIONS = {
    [TIPOS_CONTRATO_RENTA.RENTA]: 'Contrato de renta',
    [TIPOS_CONTRATO_RENTA.RESPONSABILIDAD]: 'Contrato de responsabilidad',
    [TIPOS_CONTRATO_RENTA.VACIO]: 'Contrato vacío',
};

const normalizeSearchText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();




const getEntityId = (entity) => entity?.id ?? entity?._id;

const getSyncedCliente = (renta, clientesById) => {
    const clienteId = renta?.clienteId ?? getEntityId(renta?.cliente);
    if (!clienteId) return renta?.cliente ?? {};
    return clientesById.get(String(clienteId)) ?? renta?.cliente ?? {};
};

const getClientInitials = (name = '') => {
    const nameParts = String(name).trim().split(/\s+/).filter(Boolean);
    const initials = nameParts.slice(0, 2).map((part) => part.charAt(0)).join('');
    return initials.toUpperCase() || 'CL';
};

const formatTimeOnly = (timeValue) => {
    if (!timeValue) return '';

    const rawTime = String(timeValue).trim();
    const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return rawTime;

    const [, hourValue, minuteValue] = timeMatch;
    const hour = Number(hourValue);
    if (Number.isNaN(hour)) return rawTime;

    const period = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 || 12;
    return `${String(normalizedHour).padStart(2, '0')}:${minuteValue} ${period}`;
};

const renderCalendarIcon = (className) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M3.5 9.5h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </svg>
);

const MONTH_FILTER_OPTIONS = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
];

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

const parseDateOnly = (dateValue) => {
    if (!dateValue) return null;
    const dateString = String(dateValue).slice(0, 10);
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const Renta = () => {
    const formatDateOnly = (dateValue) => {
        if (!dateValue) return '';
        const dateString = String(dateValue).slice(0, 10);
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const { loading } = useAuth();
    const { clientes } = useCliente();
    const currentYear = new Date().getFullYear();
    const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('');
    const [selectedIncomeMonth, setSelectedIncomeMonth] = useState(String(new Date().getMonth()));
    const [selectedIncomeYear, setSelectedIncomeYear] = useState(String(currentYear));


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
    const clientesById = useMemo(() => new Map(
        clientes.map((cliente) => [String(getEntityId(cliente)), cliente])
    ), [clientes]);
    const query = normalizeSearchText(searchParams.get('q') ?? '');
    const selectedMonth = getMonthFromQuery(query);
    const searchedDate = getDateFromQuery(query);
    const availableVehicleOptions = useMemo(() => {
        const vehiclesByPlate = new Map();

        rentas.forEach((renta) => {
            const placa = String(renta.vehiculo?.placa ?? '').trim();
            if (!placa) return;

            const nombreVehiculo = String(renta.vehiculo?.nombreVehiculo ?? 'Vehículo').trim();
            vehiclesByPlate.set(placa, `${placa} - ${nombreVehiculo}`);
        });

        return [...vehiclesByPlate.entries()]
            .map(([placa, label]) => ({ placa, label }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [rentas]);

    const availableYears = useMemo(() => {
        const years = new Set([currentYear]);

        rentas.forEach((renta) => {
            const fechaEntrega = parseDateOnly(renta.fechaEntrega);
            if (fechaEntrega) years.add(fechaEntrega.getFullYear());
        });

        return [...years].sort((a, b) => b - a);
    }, [currentYear, rentas]);

    const vehicleIncomeSummary = useMemo(() => {
        if (!selectedVehiclePlate || selectedIncomeMonth === '') {
            return { total: 0, rentalCount: 0 };
        }

        const selectedMonthNumber = Number(selectedIncomeMonth);
        const selectedYearNumber = Number(selectedIncomeYear);

        return rentas.reduce((summary, renta) => {
            const placa = String(renta.vehiculo?.placa ?? '').trim();
            const fechaEntrega = parseDateOnly(renta.fechaEntrega);
            if (!fechaEntrega) return summary;

            const matchesPlate = placa === selectedVehiclePlate;
            const matchesMonth = fechaEntrega.getMonth() === selectedMonthNumber;
            const matchesYear = fechaEntrega.getFullYear() === selectedYearNumber;

            if (!matchesPlate || !matchesMonth || !matchesYear) return summary;

            return {
                total: summary.total + Number(renta.valorTotal || 0),
                rentalCount: summary.rentalCount + 1,
            };
        }, { total: 0, rentalCount: 0 });
    }, [rentas, selectedIncomeMonth, selectedIncomeYear, selectedVehiclePlate]);

    const selectedVehicleLabel = availableVehicleOptions.find((vehicle) => vehicle.placa === selectedVehiclePlate)?.label ?? 'Selecciona una placa';
    const selectedMonthLabel = MONTH_FILTER_OPTIONS.find((month) => String(month.value) === selectedIncomeMonth)?.label ?? 'Mes';

    const rentasFiltradas = !query
        ? rentas
        : rentas.filter((renta) => {
            const clienteActualizado = getSyncedCliente(renta, clientesById);
            const nombreCliente = normalizeSearchText(clienteActualizado?.nombre ?? '');
            const cedulaCliente = normalizeSearchText(clienteActualizado?.identificacion ?? '');
            const nombreVehiculo = normalizeSearchText(renta.vehiculo?.nombreVehiculo ?? '');
            const placaVehiculo = normalizeSearchText(renta.vehiculo?.placa ?? '');
            const fechaEntrega = parseDateOnly(renta.fechaEntrega);
            const fechaDevolucion = parseDateOnly(renta.fechaDevolucion);
            const coincideTexto = nombreCliente.includes(query)
                || cedulaCliente.includes(query)
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
            text: 'Elige el documento que quieres generar para esta renta.',
            icon: 'question',
            input: 'select',
            inputOptions: CONTRATOS_RENTA_SELECT_OPTIONS,
            inputValue: TIPOS_CONTRATO_RENTA.RENTA,
            showCancelButton: true,
            confirmButtonText: 'Descargar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'confirmarBoton',
                cancelButton: 'cancelBoton',
            },
        });

        if (!result.isConfirmed) return;

        await descargarContrato({
            rentaId,
            tipoContrato: result.value,
            contratoVacio: result.value === TIPOS_CONTRATO_RENTA.VACIO,
        });
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

            <section className={styles.vehicleIncomeFilterCard}>
                <div className={styles.vehicleIncomeFilterHeader}>
                    <div>
                        <h3>Total por vehículo</h3>
                        <p>Escoge la placa y el mes para ver cuánto dinero hizo ese carro.</p>
                    </div>
                    <div className={styles.vehicleIncomeTotalBox}>
                        <span>Total generado</span>
                        <strong>
                            {vehicleIncomeSummary.total.toLocaleString('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </strong>
                    </div>
                </div>

                <div className={styles.vehicleIncomeFilterGrid}>
                    <label className={styles.vehicleIncomeFilterLabel}>
                        Placa
                        <select
                            value={selectedVehiclePlate}
                            onChange={(event) => setSelectedVehiclePlate(event.target.value)}
                        >
                            <option value="">Selecciona una placa</option>
                            {availableVehicleOptions.map((vehicle) => (
                                <option key={vehicle.placa} value={vehicle.placa}>{vehicle.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.vehicleIncomeFilterLabel}>
                        Mes
                        <select
                            value={selectedIncomeMonth}
                            onChange={(event) => setSelectedIncomeMonth(event.target.value)}
                        >
                            {MONTH_FILTER_OPTIONS.map((month) => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.vehicleIncomeFilterLabel}>
                        Año
                        <select
                            value={selectedIncomeYear}
                            onChange={(event) => setSelectedIncomeYear(event.target.value)}
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={styles.vehicleIncomeResultDetails}>
                    <span>{selectedVehicleLabel}</span>
                    <strong>{selectedMonthLabel} {selectedIncomeYear}</strong>
                    <small>{vehicleIncomeSummary.rentalCount} renta(s) encontradas para este filtro.</small>
                </div>
            </section>


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
                                    const clienteActualizado = getSyncedCliente(renta, clientesById);
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
                                <td>
                                    <div className={styles.clientCell}>
                                        <span className={`${styles.clientAvatar} ${estadoClase}`}>
                                            {getClientInitials(clienteActualizado?.nombre)}
                                        </span>
                                        <div className={styles.clientInfo}>
                                            <span className={styles.clientName}>{clienteActualizado?.nombre}</span>
                                            <span className={styles.clientId}>CC {clienteActualizado?.identificacion ?? 'Sin identificar'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.vehicleNameCell}>{renta.vehiculo?.nombreVehiculo}</td>
                                <td>{renta.vehiculo?.placa}</td>
                                <td>
                                    <div className={styles.dateCell}>
                                        {renderCalendarIcon(`${styles.calendarIcon} ${styles.deliveryIcon}`)}
                                        <div className={styles.dateInfo}>
                                            <span className={styles.dateText}>{formatDateOnly(renta.fechaEntrega)}</span>
                                            <span className={styles.timeText}>{formatTimeOnly(renta.horaEntrega)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.dateCell}>
                                        {renderCalendarIcon(`${styles.calendarIcon} ${styles.returnIcon}`)}
                                        <div className={styles.dateInfo}>
                                            <span className={styles.dateText}>{formatDateOnly(renta.fechaDevolucion)}</span>
                                            <span className={styles.timeText}>{formatTimeOnly(renta.horaDevolucion)}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.totalValueCell}>
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
                                            : 'Contratos'}
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

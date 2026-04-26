import { useState, useEffect } from 'react';
import useRenta from '../../hooks/useRenta.jsx';
import styles from '../Renta/renta.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarrenta from '../Renta/Agregarrenta.jsx';



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

    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';


    const { rentas, descargarContrato, isDownloadingContrato, downloadingRentaId } = useRenta();
    const handleDownloadContrato = async (rentaId) => {
        await descargarContrato({ rentaId });
    };




    //------------- CARUCEL
    const [currentSlide, setCurrentSlide] = useState(0);
    const cardsPerPage = 4;

    const totalSlides = Math.ceil(rentas.length / cardsPerPage);

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const startIndex = currentSlide * cardsPerPage;
    const visibleRentas = rentas.slice(startIndex, startIndex + cardsPerPage);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ⏱ Cambio automático de slide cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : 0));
        }, 5000); // 5000 ms = 5 segundos

        return () => clearInterval(interval); // Limpieza del intervalo
    }, [totalSlides]);







    return (


        <div className={styles.wrapper}>
            <h2 className={styles.heading}>RENTAS</h2>

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
                        {rentas.map((renta) => (
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

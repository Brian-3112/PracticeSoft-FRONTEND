import { useEffect, useMemo, useState } from 'react';
import useVehiculo from '../../hooks/useVehiculo';
import styles from './disponibilidad.module.css';

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const parseDateOnly = (dateValue) => {
  if (!dateValue) return null;
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const MonthCalendar = ({ date, occupiedDates }) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthLabel = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const cells = getMonthGrid(year, month);

  return (
    <div className={styles.monthCard}>
      <h4 className={styles.monthTitle}>{monthLabel}</h4>
      <div className={styles.weekHeader}>
        {DIAS_SEMANA.map((dia) => <span key={dia}>{dia}</span>)}
      </div>
      <div className={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell) return <span key={`empty-${idx}`} className={styles.emptyCell}> </span>;
          const key = cell.toISOString().slice(0, 10);
          const ocupado = occupiedDates.has(key);
          return (
            <span key={key} className={`${styles.dayCell} ${ocupado ? styles.rentado : styles.disponible}`}>
              {cell.getDate()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Disponibilidad = () => {
  const { vehiculos, rentas } = useVehiculo();
  const [selectedVehiculoId, setSelectedVehiculoId] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    if (!selectedVehiculoId && vehiculos?.length) {
      setSelectedVehiculoId(vehiculos[0].id);
    }
  }, [selectedVehiculoId, vehiculos]);

  const selectedVehiculo = useMemo(() => {
    if (!vehiculos?.length) return null;
    return vehiculos.find((v) => Number(v.id) === Number(selectedVehiculoId)) || vehiculos[0];
  }, [vehiculos, selectedVehiculoId]);

  const occupiedDates = useMemo(() => {
    if (!selectedVehiculo) return new Set();

    const fechas = new Set();
    (rentas || []).forEach((renta) => {
      const rentaVehiculoId = renta.vehiculo?.id ?? renta.vehiculoId;
      if (Number(rentaVehiculoId) !== Number(selectedVehiculo.id)) return;

      const start = parseDateOnly(renta.fechaEntrega);
      const end = parseDateOnly(renta.fechaDevolucion);
      if (!start || !end) return;

      const cursor = new Date(start);
      while (cursor <= end) {
        fechas.add(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return fechas;
  }, [rentas, selectedVehiculo]);

  const hoy = new Date();
  const mes1 = new Date(hoy.getFullYear(), hoy.getMonth() + monthOffset, 1);
  const mes2 = new Date(hoy.getFullYear(), hoy.getMonth() + monthOffset + 1, 1);

  return (
    <div className={styles.wrapper}>
      <aside className={styles.fleetPanel}>
        <h3>Flota</h3>
        <div className={styles.vehicleList}>
          {(vehiculos || []).map((vehiculo) => (
            <button
              type="button"
              key={vehiculo.id}
              className={`${styles.vehicleBtn} ${Number(selectedVehiculo?.id) === Number(vehiculo.id) ? styles.active : ''}`}
              onClick={() => setSelectedVehiculoId(vehiculo.id)}
            >
              <span className={styles.vehicleName}>{vehiculo.nombreVehiculo}</span>
              <span className={styles.vehiclePlate}>{vehiculo.placa}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.calendarPanel}>
        <div className={styles.header}>
          <h2>{selectedVehiculo?.nombreVehiculo || 'Disponibilidad'}</h2>
          <div className={styles.monthNav}>
            <button type="button" className={styles.monthBtn} onClick={() => setMonthOffset((prev) => prev - 2)} aria-label="Mes anterior">
              ←
            </button>
            <button type="button" className={styles.monthBtn} onClick={() => setMonthOffset((prev) => prev + 2)} aria-label="Mes siguiente">
              →
            </button>
          </div>
          <div className={styles.legend}>
            <span><i className={`${styles.dot} ${styles.dotRed}`} />Rentado</span>
            <span><i className={`${styles.dot} ${styles.dotGreen}`} />Disponible</span>
          </div>
        </div>

        <div className={styles.monthsGrid}>
          <MonthCalendar date={mes1} occupiedDates={occupiedDates} />
          <MonthCalendar date={mes2} occupiedDates={occupiedDates} />
        </div>
      </section>
    </div>
  );
};

export default Disponibilidad;

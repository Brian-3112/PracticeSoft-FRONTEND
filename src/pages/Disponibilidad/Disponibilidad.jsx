import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useVehiculo from '../../hooks/useVehiculo';
import styles from './disponibilidad.module.css';

const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

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

const MiniCalendar = ({ monthDate, occupiedDates }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = getMonthGrid(year, month);

  return (
    <div className={styles.calendarMini}>
      <div className={styles.weekHeader}>
        {DIAS_SEMANA.map((dia, idx) => <span key={`${dia}-${idx}`}>{dia}</span>)}
      </div>
      <div className={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell) return <span key={`e-${idx}`} className={styles.emptyCell}> </span>;
          const key = cell.toISOString().slice(0, 10);
          const ocupado = occupiedDates.has(key);
          return <span key={key} className={`${styles.dayCell} ${ocupado ? styles.rentado : styles.disponible}`}>{cell.getDate()}</span>;
        })}
      </div>
    </div>
  );
};

MiniCalendar.propTypes = {
  monthDate: PropTypes.instanceOf(Date).isRequired,
  occupiedDates: PropTypes.instanceOf(Set).isRequired,
};

const Disponibilidad = () => {
  const { vehiculos, rentas } = useVehiculo();
  const [monthOffset, setMonthOffset] = useState(0);

  const monthDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const monthLabel = monthDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  const occupiedByVehiculo = useMemo(() => {
    const map = new Map();
    (vehiculos || []).forEach((v) => map.set(Number(v.id), new Set()));

    (rentas || []).forEach((renta) => {
      const vehiculoId = Number(renta.vehiculo?.id ?? renta.vehiculoId);
      if (!map.has(vehiculoId)) return;

      const start = parseDateOnly(renta.fechaEntrega);
      const end = parseDateOnly(renta.fechaDevolucion);
      if (!start || !end) return;

      const cursor = new Date(start);
      while (cursor <= end) {
        map.get(vehiculoId).add(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return map;
  }, [vehiculos, rentas]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button type="button" className={styles.monthBtn} onClick={() => setMonthOffset((prev) => prev - 1)} aria-label="Mes anterior">←</button>
          <p className={styles.monthTitle}>{monthLabel}</p>
          <button type="button" className={styles.monthBtn} onClick={() => setMonthOffset((prev) => prev + 1)} aria-label="Mes siguiente">→</button>
        </div>
      </div>

      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.dotRed}`} />Rentado</span>
        <span><i className={`${styles.dot} ${styles.dotGreen}`} />Disponible</span>
      </div>

      <div className={styles.vehicleGrid}>
        {(vehiculos || []).length === 0 ? (
          <p className={styles.emptyStateMessage}>No hay Vehiculos asociados.</p>
        ) : (vehiculos || []).map((vehiculo) => (
          <article key={vehiculo.id} className={styles.vehicleCard}>
            <div className={styles.vehicleHead}>
              <h3>{vehiculo.nombreVehiculo}</h3>
              <p>{vehiculo.placa}</p>
            </div>
            <MiniCalendar monthDate={monthDate} occupiedDates={occupiedByVehiculo.get(Number(vehiculo.id)) || new Set()} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default Disponibilidad;

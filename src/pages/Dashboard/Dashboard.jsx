import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line, Doughnut } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';


const INGRESOS_MES_VISIBILITY_KEY = 'dashboard:mostrarIngresosMes';
const INGRESOS_ANUAL_VISIBILITY_KEY = 'dashboard:mostrarIngresosAnual';

const getStoredVisibility = (key) => {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(key) !== 'false';
};

const parseDateOnly = (dateValue) => {
  if (!dateValue) return null;
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const Dashboard = () => {
  const { auth, loading } = useAuth();
  const { ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual } = useDashboard();
  const [mostrarIngresosMes, setMostrarIngresosMes] = useState(() => getStoredVisibility(INGRESOS_MES_VISIBILITY_KEY));
  const [mostrarIngresosAnual, setMostrarIngresosAnual] = useState(() => getStoredVisibility(INGRESOS_ANUAL_VISIBILITY_KEY));

  useEffect(() => {
    window.localStorage.setItem(INGRESOS_MES_VISIBILITY_KEY, String(mostrarIngresosMes));
  }, [mostrarIngresosMes]);

  useEffect(() => {
    window.localStorage.setItem(INGRESOS_ANUAL_VISIBILITY_KEY, String(mostrarIngresosAnual));
  }, [mostrarIngresosAnual]);

  if (loading) return 'Cargando...';
  if (!auth) return <Navigate to="/login" />;

  const labelsMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const dataIngresos = {
    labels: labelsMeses,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresosPorMes,
        borderColor: '#173680',
        backgroundColor: 'rgba(23, 54, 128, 0.14)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointHitRadius: 20,
      },
    ],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const estadoRentas = rentas.reduce(
    (acc, renta) => {
      const fechaEntrega = parseDateOnly(renta.fechaEntrega);
      const fechaDevolucion = parseDateOnly(renta.fechaDevolucion);

      if (!fechaEntrega || !fechaDevolucion) return acc;

      if (today < fechaEntrega) acc.pendiente += 1;
      else if (today <= fechaDevolucion) acc.enCurso += 1;
      else acc.finalizada += 1;

      return acc;
    },
    { pendiente: 0, enCurso: 0, finalizada: 0 }
  );

  const dataEstadoRentas = {
    labels: ['En curso', 'Pendiente', 'Finalizada'],
    datasets: [
      {
        data: [estadoRentas.enCurso, estadoRentas.pendiente, estadoRentas.finalizada],
        backgroundColor: ['#1ea76a', '#f59e0b', '#173680'],
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.dashboardContainer}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Ingresos del mes</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue}>
                  {mostrarIngresosMes ? ingresosMes.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '••••••••'}
                </p>
                <button type="button" className={styles.eyeButton} onClick={() => setMostrarIngresosMes((prev) => !prev)} aria-label={mostrarIngresosMes ? 'Ocultar ingresos del mes' : 'Mostrar ingresos del mes'}>
                  👁️
                </button>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Ingresos anuales</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue}>
                  {mostrarIngresosAnual ? ingresosAnual.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '••••••••'}
                </p>
                <button type="button" className={styles.eyeButton} onClick={() => setMostrarIngresosAnual((prev) => !prev)} aria-label={mostrarIngresosAnual ? 'Ocultar ingresos anuales' : 'Mostrar ingresos anuales'}>
                  👁️
                </button>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Clientes registrados</p>
              <p className={styles.statValue}># {clientesTotal}</p>
            </div>
          </div>
        </div>

        <div className={styles.chartTableWrapper}>
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Ingresos mensuales</h3>
            <p className={styles.chartSubtitle}>Últimos 12 meses</p>
            <div className={styles.chartWrapper}>
              <Line
                data={dataIngresos}
                options={{
                  responsive: true,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const valor = context.parsed.y || 0;
                          return `Ingresos: ${valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { display: false }, grid: { display: false } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          <div className={styles.donutContainer}>
            <h3 className={styles.chartTitle}>Estado de rentas</h3>
            <p className={styles.chartSubtitle}>{rentas.length} rentas totales</p>
            <div className={styles.donutWrapper}>
              <Doughnut
                data={dataEstadoRentas}
                options={{
                  cutout: '63%',
                  plugins: { legend: { display: false } },
                }}
              />
            </div>

            <ul className={styles.legendList}>
              <li><span className={`${styles.legendDot} ${styles.dotEnCurso}`} />En curso <strong>{estadoRentas.enCurso}</strong></li>
              <li><span className={`${styles.legendDot} ${styles.dotPendiente}`} />Pendiente <strong>{estadoRentas.pendiente}</strong></li>
              <li><span className={`${styles.legendDot} ${styles.dotFinalizada}`} />Finalizada <strong>{estadoRentas.finalizada}</strong></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

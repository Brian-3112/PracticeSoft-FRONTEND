import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line, Doughnut } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';

const Dashboard = () => {
  const { auth, loading } = useAuth();
  const { ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual } = useDashboard();

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
        pointRadius: 0,
      },
    ],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const estadoRentas = rentas.reduce(
    (acc, renta) => {
      const fechaEntrega = new Date(String(renta.fechaEntrega).slice(0, 10));
      const fechaDevolucion = new Date(String(renta.fechaDevolucion).slice(0, 10));

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
              <p className={styles.statValue}>
                {ingresosMes.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Ingresos anuales</p>
              <p className={styles.statValue}>
                {ingresosAnual.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </p>
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
                  plugins: { legend: { display: false } },
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

import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';

const Dashboard = () => {
  const { auth, loading } = useAuth();
  const { ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual } = useDashboard();

  if (loading) return 'Cargando...';
  if (!auth) return <Navigate to="/login" />;

  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [
      {
        label: "Ingresos",
        data: ingresosPorMes,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>DASHBOARD</h2>

      {/* Contenedor principal */}
      <div className={styles.dashboardContainer}>

        {/* Tarjetas de estadísticas */}
        <div className={styles.statsContainer}>

          {/* Ingresos del mes */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Ingresos del mes</p>
              <p className={styles.statValue}>
                {ingresosMes.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>
          </div>

          {/* Ingresos anuales */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <p className={styles.statTitle}>Ingresos anuales</p>
              <p className={styles.statValue}>
                {ingresosAnual.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>
          </div>

          {/* Clientes registrados */}
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
            <h3 className={styles.chartTitle}>Ingresos por mes</h3>
            <div className={styles.chartWrapper}>
              <Line data={data} />
            </div>
          </div>

          {/* Tabla de historial */}
          {/* <div className={styles.tableContainer}>
            <h3 className={styles.chartTitle}>Historial de Renta</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Cliente</th>
                  <th>Entrega</th>
                  <th>Devolución</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rentas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.vehiculo?.nombreVehiculo}</td>
                    <td>{r.cliente?.nombre}</td>
                    <td>{new Date(r.fechaEntrega).toLocaleDateString()}</td>
                    <td>{new Date(r.fechaDevolucion).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`${styles.status} ${new Date(r.fechaDevolucion) >= new Date()
                          ? styles.active
                          : styles.finished
                          }`}
                      >
                        {new Date(r.fechaDevolucion) >= new Date()
                          ? "En curso"
                          : "Finalizada"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </div>


      </div>


    </div>
  );
};

export default Dashboard;

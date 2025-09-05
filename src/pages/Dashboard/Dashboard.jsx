import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';

const Dashboard = () => {

  const { auth, loading } = useAuth();
  const { ingresosMes, clientesTotal, ingresosPorMes } = useDashboard();

  if (loading) return 'Cargando...';
  if (!auth) return <Navigate to="/login" />;

  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [
      {
        label: "Ingresos",
        data: ingresosPorMes,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
          <h3>Ingresos del mes</h3>
          <p>${ingresosMes.toLocaleString()}</p>
        </div>

        <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
          <h3>Clientes registrados</h3>
          <p>{clientesTotal}</p>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
        <h3>Ingresos por mes</h3>
        <Line data={data} />
      </div>
    </div>
  );
};

export default Dashboard;

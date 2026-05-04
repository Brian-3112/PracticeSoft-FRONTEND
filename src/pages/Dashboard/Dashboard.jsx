import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

  const mesActual = today.getMonth();
  const anioActual = today.getFullYear();
  const rentasMesActual = rentas.filter((renta) => {
    const fechaEntrega = new Date(renta.fechaEntrega);
    return fechaEntrega.getMonth() === mesActual && fechaEntrega.getFullYear() === anioActual;
  });

  const resumenVehiculosMes = rentasMesActual.reduce((acc, renta) => {
    const vehiculo = renta.vehiculo?.nombreVehiculo || 'Vehículo';
    const placa = renta.vehiculo?.placa ? ` (${renta.vehiculo.placa})` : '';
    const key = `${vehiculo}${placa}`;

    if (!acc[key]) {
      acc[key] = { salidas: 0, ingresos: 0 };
    }

    acc[key].salidas += 1;
    acc[key].ingresos += Number(renta.valorTotal || 0);
    return acc;
  }, {});

  const vehiculosOrdenados = Object.entries(resumenVehiculosMes)
    .sort(([, a], [, b]) => b.ingresos - a.ingresos)
    .slice(0, 8);

  const dataIngresosVehiculoMes = {
    labels: vehiculosOrdenados.map(([nombre]) => nombre),
    datasets: [
      {
        label: 'Ingresos por vehículo',
        data: vehiculosOrdenados.map(([, valores]) => valores.ingresos),
        backgroundColor: '#173680',
        borderRadius: 6,
      },
    ],
  };

  const handleDescargarReporte = () => {
    const fechaActual = new Date();
    const fechaGeneracion = fechaActual.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const nombreMes = fechaActual.toLocaleDateString('es-CO', { month: 'long' });
    const topVehiculosTexto = vehiculosOrdenados.length
      ? vehiculosOrdenados
        .map(([nombre, valores], index) =>
          `${index + 1}. ${nombre}: ${valores.salidas} salidas, ${valores.ingresos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
        )
        .join('\n')
      : 'No se registraron rentas para el mes actual.';

    const reporte = `REPORTE EJECUTIVO DE INGRESOS - ANTIOCAR
Fecha de generación: ${fechaGeneracion}

Estimados directivos,

Por medio del presente informe se comparte el resumen financiero del periodo actual:

1. Ingreso mensual (${nombreMes}):
   ${ingresosMes.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}

2. Ingreso anual acumulado:
   ${ingresosAnual.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}

3. Estado de rentas:
   - En curso: ${estadoRentas.enCurso}
   - Pendiente: ${estadoRentas.pendiente}
   - Finalizada: ${estadoRentas.finalizada}

4. Vehículos con mayor generación de ingresos del mes:
${topVehiculosTexto}

Conclusión:
Los resultados evidencian el desempeño operativo y comercial del periodo, permitiendo identificar la participación de cada vehículo en la generación de ingresos y facilitando la toma de decisiones estratégicas.

Cordialmente,
Sistema de Gestión ANTIOCAR
`;

    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-dashboard-${fechaActual.toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.dashboardContainer}>
        <div className={styles.reportActions}>
          <button type="button" className={styles.reportButton} onClick={handleDescargarReporte}>
            Descargar reporte formal
          </button>
        </div>
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

        <div className={styles.vehicleChartContainer}>
          <h3 className={styles.chartTitle}>Carros que salieron en el mes</h3>
          <p className={styles.chartSubtitle}>Salidas y generación de ingresos del mes actual</p>

          {vehiculosOrdenados.length === 0 ? (
            <p className={styles.emptyMessage}>No hay rentas registradas este mes.</p>
          ) : (
            <>
              <div className={styles.vehicleChartWrapper}>
                <Bar
                  data={dataIngresosVehiculoMes}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => `$ ${Number(value).toLocaleString('es-CO')}` },
                        grid: { color: 'rgba(79, 99, 141, 0.12)' },
                      },
                      x: { ticks: { maxRotation: 18, minRotation: 0 } },
                    },
                  }}
                />
              </div>

              <ul className={styles.vehicleSummaryList}>
                {vehiculosOrdenados.map(([nombre, valores]) => (
                  <li key={nombre}>
                    <span>{nombre}</span>
                    <strong>{valores.salidas} salidas · {valores.ingresos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

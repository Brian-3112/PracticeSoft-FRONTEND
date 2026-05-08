import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';

const textEncoder = new TextEncoder();

const parseDateOnly = (dateValue) => {
  if (!dateValue) return null;
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const createCrcTable = () => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[i] = crc >>> 0;
  }

  return table;
};

const crcTable = createCrcTable();

const calculateCrc32 = (data) => {
  let crc = 0xffffffff;

  data.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
};

const writeUint16 = (buffer, offset, value) => {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
};

const writeUint32 = (buffer, offset, value) => {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
};

const concatUint8Arrays = (arrays) => {
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((array) => {
    result.set(array, offset);
    offset += array.length;
  });

  return result;
};

const createStoredZip = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = textEncoder.encode(name);
    const contentBytes = textEncoder.encode(content);
    const crc = calculateCrc32(contentBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, 0);
    writeUint16(localHeader, 12, 0);
    writeUint32(localHeader, 14, crc);
    writeUint32(localHeader, 18, contentBytes.length);
    writeUint32(localHeader, 22, contentBytes.length);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, 0);
    writeUint16(centralHeader, 14, 0);
    writeUint32(centralHeader, 16, crc);
    writeUint32(centralHeader, 20, contentBytes.length);
    writeUint32(centralHeader, 24, contentBytes.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, offset);
  writeUint16(endRecord, 20, 0);

  return concatUint8Arrays([...localParts, centralDirectory, endRecord]);
};

const createParagraphXml = (text, options = {}) => {
  const bold = options.bold ? '<w:b/>' : '';
  const fontSize = options.fontSize ? `<w:sz w:val="${options.fontSize}"/>` : '';
  const justification = options.center ? '<w:jc w:val="center"/>' : '';

  return `<w:p><w:pPr>${justification}</w:pPr><w:r><w:rPr>${bold}${fontSize}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
};

const createExecutiveReportDocx = (lines) => {
  const documentBody = lines.map((line, index) => createParagraphXml(line, {
    bold: index === 0,
    center: index === 0,
    fontSize: index === 0 ? 28 : 22,
  })).join('');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${documentBody}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

  const zipContent = createStoredZip([
    {
      name: '[Content_Types].xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    },
    {
      name: '_rels/.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    },
    {
      name: 'word/document.xml',
      content: documentXml,
    },
  ]);

  return new Blob([zipContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

const Dashboard = () => {
  const { auth, loading } = useAuth();
  const { ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual } = useDashboard();
  const [mostrarIngresosMes, setMostrarIngresosMes] = useState(true);
  const [mostrarIngresosAnual, setMostrarIngresosAnual] = useState(true);

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

  const mesActual = today.getMonth();
  const anioActual = today.getFullYear();
  const rentasMesActual = rentas.filter((renta) => {
    const fechaEntrega = parseDateOnly(renta.fechaEntrega);
    return fechaEntrega?.getMonth() === mesActual && fechaEntrega.getFullYear() === anioActual;
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
    const ingresoMensualTexto = ingresosMes.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    });
    const ingresoAnualTexto = ingresosAnual.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    });

    const reporteLineas = [
      'REPORTE EJECUTIVO DE INGRESOS – ANTIOCAR',
      `Fecha de generación: ${fechaGeneracion}`,
      '',
      'Estimados directivos,',
      '',
      `A continuación, se presenta el resumen financiero correspondiente al periodo actual. El ingreso mensual del mes de ${nombreMes} asciende a ${ingresoMensualTexto}, mientras que el ingreso anual acumulado registra un total de ${ingresoAnualTexto}. Estos resultados reflejan el comportamiento financiero del periodo y proporcionan una base clara para el análisis y la toma de decisiones estratégicas.`,
      '',
      'Cordialmente,',
      'Sistema de Gestión ANTIOCAR',
    ];

    const blob = createExecutiveReportDocx(reporteLineas);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ejecutivo-antioCar-${fechaActual.toISOString().slice(0, 10)}.docx`;
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
              <div className={styles.statValueRow}>
                <p className={styles.statValue}>
                  {mostrarIngresosMes ? ingresosMes.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '••••••••'}
                </p>
                <button type="button" className={styles.eyeButton} onClick={() => setMostrarIngresosMes((prev) => !prev)} aria-label={mostrarIngresosMes ? 'Ocultar ingresos del mes' : 'Mostrar ingresos del mes'}>
                  {mostrarIngresosMes ? '🙈' : '👁️'}
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
                  {mostrarIngresosAnual ? ingresosAnual.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '••••••••'}
                </p>
                <button type="button" className={styles.eyeButton} onClick={() => setMostrarIngresosAnual((prev) => !prev)} aria-label={mostrarIngresosAnual ? 'Ocultar ingresos anuales' : 'Mostrar ingresos anuales'}>
                  {mostrarIngresosAnual ? '🙈' : '👁️'}
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

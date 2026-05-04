import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDashboard from '../../hooks/useDashboard';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import styles from '../Dashboard/Dashboard.module.css';
import 'chart.js/auto';

const DASHBOARD_TEMPLATE_PATH = '/templates/Certificado.docx';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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

const createParagraphXml = (text, options = {}) => {
  const bold = options.bold ? '<w:b/>' : '';
  const fontSize = options.fontSize ? `<w:sz w:val="${options.fontSize}"/>` : '';
  const color = options.color ? `<w:color w:val="${options.color}"/>` : '';
  const justification = options.center ? '<w:jc w:val="center"/>' : '';
  const spacing = options.spacing ? '<w:spacing w:after="160"/>' : '';

  return `<w:p><w:pPr>${justification}${spacing}</w:pPr><w:r><w:rPr>${bold}${fontSize}${color}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
};


const findEndOfCentralDirectory = (zipBytes) => {
  for (let index = zipBytes.length - 22; index >= 0; index -= 1) {
    if (
      zipBytes[index] === 0x50
      && zipBytes[index + 1] === 0x4b
      && zipBytes[index + 2] === 0x05
      && zipBytes[index + 3] === 0x06
    ) {
      return index;
    }
  }

  throw new Error('No se encontró el directorio central del documento DOCX.');
};

const readUint16 = (buffer, offset) => buffer[offset] | (buffer[offset + 1] << 8);

const readUint32 = (buffer, offset) => (
  buffer[offset]
  | (buffer[offset + 1] << 8)
  | (buffer[offset + 2] << 16)
  | (buffer[offset + 3] << 24)
) >>> 0;

const parseZipEntries = (zipBytes) => {
  const endDirectoryOffset = findEndOfCentralDirectory(zipBytes);
  const entriesCount = readUint16(zipBytes, endDirectoryOffset + 10);
  let centralOffset = readUint32(zipBytes, endDirectoryOffset + 16);
  const entries = [];

  for (let index = 0; index < entriesCount; index += 1) {
    if (readUint32(zipBytes, centralOffset) !== 0x02014b50) {
      throw new Error('El documento DOCX tiene una estructura ZIP inválida.');
    }

    const versionMadeBy = readUint16(zipBytes, centralOffset + 4);
    const versionNeeded = readUint16(zipBytes, centralOffset + 6);
    const flags = readUint16(zipBytes, centralOffset + 8);
    const compressionMethod = readUint16(zipBytes, centralOffset + 10);
    const modTime = readUint16(zipBytes, centralOffset + 12);
    const modDate = readUint16(zipBytes, centralOffset + 14);
    const crc = readUint32(zipBytes, centralOffset + 16);
    const compressedSize = readUint32(zipBytes, centralOffset + 20);
    const uncompressedSize = readUint32(zipBytes, centralOffset + 24);
    const fileNameLength = readUint16(zipBytes, centralOffset + 28);
    const extraLength = readUint16(zipBytes, centralOffset + 30);
    const commentLength = readUint16(zipBytes, centralOffset + 32);
    const externalAttributes = readUint32(zipBytes, centralOffset + 38);
    const localHeaderOffset = readUint32(zipBytes, centralOffset + 42);
    const nameBytes = zipBytes.slice(centralOffset + 46, centralOffset + 46 + fileNameLength);
    const name = textDecoder.decode(nameBytes);

    if (readUint32(zipBytes, localHeaderOffset) !== 0x04034b50) {
      throw new Error(`No se pudo leer la entrada ${name} del documento DOCX.`);
    }

    const localNameLength = readUint16(zipBytes, localHeaderOffset + 26);
    const localExtraLength = readUint16(zipBytes, localHeaderOffset + 28);
    const compressedDataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressedData = zipBytes.slice(compressedDataOffset, compressedDataOffset + compressedSize);

    entries.push({
      name,
      versionMadeBy,
      versionNeeded,
      flags,
      compressionMethod,
      modTime,
      modDate,
      crc,
      compressedSize,
      uncompressedSize,
      externalAttributes,
      compressedData,
    });

    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
};

const inflateRaw = async (data) => {
  if (!('DecompressionStream' in window)) {
    throw new Error('El navegador no permite descomprimir plantillas DOCX.');
  }

  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const decodeZipEntryContent = async (entry) => {
  if (entry.compressionMethod === 0) {
    return textDecoder.decode(entry.compressedData);
  }

  if (entry.compressionMethod === 8) {
    const decompressed = await inflateRaw(entry.compressedData);
    return textDecoder.decode(decompressed);
  }

  throw new Error(`La plantilla usa un método de compresión no soportado (${entry.compressionMethod}).`);
};

const createZipFromEntries = (entries) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBytes = textEncoder.encode(entry.name);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, entry.versionNeeded);
    writeUint16(localHeader, 6, entry.flags);
    writeUint16(localHeader, 8, entry.compressionMethod);
    writeUint16(localHeader, 10, entry.modTime);
    writeUint16(localHeader, 12, entry.modDate);
    writeUint32(localHeader, 14, entry.crc);
    writeUint32(localHeader, 18, entry.compressedSize);
    writeUint32(localHeader, 22, entry.uncompressedSize);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, entry.compressedData);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, entry.versionMadeBy);
    writeUint16(centralHeader, 6, entry.versionNeeded);
    writeUint16(centralHeader, 8, entry.flags);
    writeUint16(centralHeader, 10, entry.compressionMethod);
    writeUint16(centralHeader, 12, entry.modTime);
    writeUint16(centralHeader, 14, entry.modDate);
    writeUint32(centralHeader, 16, entry.crc);
    writeUint32(centralHeader, 20, entry.compressedSize);
    writeUint32(centralHeader, 24, entry.uncompressedSize);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, entry.externalAttributes);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + entry.compressedData.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, entries.length);
  writeUint16(endRecord, 10, entries.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, offset);
  writeUint16(endRecord, 20, 0);

  return concatUint8Arrays([...localParts, centralDirectory, endRecord]);
};

const insertReportBeforeOwnerSignature = (documentXml, reportXml) => {
  const signatureTextIndex = documentXml.search(/CORDIALMENTE\.?/i);

  if (signatureTextIndex !== -1) {
    const signatureParagraphIndex = documentXml.lastIndexOf('<w:p', signatureTextIndex);

    if (signatureParagraphIndex !== -1) {
      return `${documentXml.slice(0, signatureParagraphIndex)}${reportXml}${documentXml.slice(signatureParagraphIndex)}`;
    }
  }

  const sectionIndex = documentXml.lastIndexOf('<w:sectPr');

  if (sectionIndex !== -1) {
    return `${documentXml.slice(0, sectionIndex)}${reportXml}${documentXml.slice(sectionIndex)}`;
  }

  throw new Error('No se encontró el espacio de la firma en la plantilla.');
};

const createStoredEntry = (entry, content) => {
  const contentBytes = textEncoder.encode(content);

  return {
    ...entry,
    versionNeeded: 10,
    flags: 0,
    compressionMethod: 0,
    crc: calculateCrc32(contentBytes),
    compressedSize: contentBytes.length,
    uncompressedSize: contentBytes.length,
    compressedData: contentBytes,
  };
};

const createExecutiveReportDocxFromTemplate = async (paragraphs) => {
  const response = await fetch(DASHBOARD_TEMPLATE_PATH);

  if (!response.ok) {
    throw new Error('No se pudo cargar la plantilla public/templates/Certificado.docx.');
  }

  const templateBytes = new Uint8Array(await response.arrayBuffer());
  const entries = parseZipEntries(templateBytes);
  const documentEntryIndex = entries.findIndex((entry) => entry.name === 'word/document.xml');

  if (documentEntryIndex === -1) {
    throw new Error('La plantilla no contiene word/document.xml.');
  }

  const documentXml = await decodeZipEntryContent(entries[documentEntryIndex]);
  const reportXml = paragraphs.map((paragraph, index) => (
    paragraph
      ? createParagraphXml(paragraph, {
        bold: index === 0,
        center: index === 0,
        fontSize: index === 0 ? 28 : 22,
        spacing: Boolean(paragraph),
      })
      : '<w:p/>'
  )).join('');
  const updatedDocumentXml = insertReportBeforeOwnerSignature(documentXml, reportXml);
  const updatedEntries = entries.map((entry, index) => (
    index === documentEntryIndex ? createStoredEntry(entry, updatedDocumentXml) : entry
  ));

  const zipContent = createZipFromEntries(updatedEntries);
  return new Blob([zipContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

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

  const handleDescargarReporte = async () => {
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
      '',
    ];

    try {
      const blob = await createExecutiveReportDocxFromTemplate(reporteLineas);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ejecutivo-antioCar-${fechaActual.toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar reporte con plantilla:', error);
      window.alert(error.message || 'No se pudo generar el reporte con la plantilla.');
    }
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

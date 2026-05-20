import { useState } from 'react';
import useAuth from '../../hooks/useAuth.jsx';
import useVehiculo from '../../hooks/useVehiculo.jsx';
import styles from '../Vehiculo/vehiculo.module.css';
import Agregarvehiculo from '../Vehiculo/Agregarvehiculo.jsx';
import VerInfoVehiculo from '../Vehiculo/VerInfoVehiculo.jsx';
import Editarvehiculo from '../Vehiculo/Editarvehiculo.jsx';
import { useSearchParams } from 'react-router-dom';


const formatDateOnly = (dateValue) => {
  if (!dateValue) return '';
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
};

const isDateValid = (dateValue) => {
  if (!dateValue) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = String(dateValue).slice(0, 10);
  const [year, month, day] = dateString.split('-').map(Number);
  const dateToValidate = new Date(year, month - 1, day);
  return dateToValidate >= today;
};

const renderCalendarIcon = (className) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M3.5 9.5h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
  </svg>
);

const renderValidityDate = (dateValue, styles) => {
  const vigente = isDateValid(dateValue);
  const statusClass = vigente ? styles.validDate : styles.expiredDate;

  return (
    <div className={`${styles.validityDateCell} ${statusClass}`}>
      {renderCalendarIcon(styles.validityCalendarIcon)}
      <div className={styles.validityDateInfo}>
        <span className={styles.validityDateText}>{formatDateOnly(dateValue)}</span>
        <span className={styles.validityStatusText}>{vigente ? 'Vigente' : 'Vencido'}</span>
      </div>
    </div>
  );
};

const Vehiculo = () => {
  const { loading } = useAuth();
  const {
    vehiculos,
    eliminarVehiculo,
    rentas,
  } = useVehiculo();
  const [searchParams] = useSearchParams();
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  const vehiculosFiltrados = !query
    ? vehiculos
    : vehiculos.filter((vehiculo) => {
      const nombre = String(vehiculo.nombreVehiculo ?? '').toLowerCase();
      const placa = String(vehiculo.placa ?? '').toLowerCase();
      return nombre.includes(query) || placa.includes(query);
    });

  const parseDateOnly = (dateValue) => {
    if (!dateValue) return null;
    const dateString = String(dateValue).slice(0, 10);
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getEstadoVehiculo = (vehiculoId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rentaActiva = rentas.some((renta) => {
      const idAsociado = renta.vehiculoId ?? renta.vehiculo?.id;
      const fechaInicio = parseDateOnly(renta.fechaEntrega ?? renta.fechaInicio);
      const fechaFin = parseDateOnly(renta.fechaDevolucion ?? renta.fechaFin);

      return (
        String(idAsociado) === String(vehiculoId) &&
        fechaInicio &&
        fechaFin &&
        today >= fechaInicio &&
        today <= fechaFin
      );
    });

    return rentaActiva ? 'Rentado' : 'Disponible';
  };


  if (loading) return 'Cargando...';

  return (
    <div className={styles.wrapper}>
      <div className={styles.divAddVehiculo}>
        <Agregarvehiculo />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Placa</th>
              <th>Soat</th>
              <th>Tecnomecanica</th>
              <th>Estado</th>
              <th>Información</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyStateCell}>
                  {query ? 'No hay vehículos que coincidan con la búsqueda.' : 'No hay Vehiculos registrados'}
                </td>
              </tr>
            ) : vehiculosFiltrados.map((vehiculo) => {
              const estado = getEstadoVehiculo(vehiculo.id);
              return (
                <tr key={vehiculo.id}>
                  <td>{vehiculo.nombreVehiculo}</td>
                  <td>{vehiculo.placa}</td>
                  <td>{renderValidityDate(vehiculo.fechaSOAT, styles)}</td>
                  <td>{renderValidityDate(vehiculo.fechaTecno, styles)}</td>
                  <td>
                    <span className={`${styles.estadoBadge} ${estado === 'Rentado' ? styles.estadoRentado : styles.estadoDisponible}`}>
                      {estado}
                    </span>
                  </td>
                  <td><button onClick={() => setSelectedVehiculo(vehiculo)} className={`${styles.iconOnlyButton} ${styles.infoButton}`}>
                    <svg className={`${styles.iconButton} ${styles.ver}`} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8.25h8M8 12h5" />
                      <circle cx="16.75" cy="15.75" r="2.25" />
                    </svg>
                  </button></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setEditingVehiculo(vehiculo)}
                      className={`${styles.actionButton} ${styles.editActionButton}`}
                      aria-label={`Editar vehículo ${vehiculo.nombreVehiculo}`}
                      title="Editar vehículo"
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarVehiculo(vehiculo.id)}
                      className={`${styles.actionButton} ${styles.deleteActionButton}`}
                      aria-label={`Eliminar vehículo ${vehiculo.nombreVehiculo}`}
                      title="Eliminar vehículo"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedVehiculo && (
        <VerInfoVehiculo
          vehiculo={selectedVehiculo}
          onClose={() => setSelectedVehiculo(null)}
        />
      )}

      {editingVehiculo && (
        <Editarvehiculo
          vehiculo={editingVehiculo}
          onClose={() => setEditingVehiculo(null)}
        />
      )}
    </div>
  );
};

export default Vehiculo;

import { useState } from 'react';
import useCliente from '../../hooks/useCliente.jsx';
import styles from '../Cliente/cliente.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarcliente from '../Cliente/Agregarcliente.jsx';
import VerInfoCliente from '../Cliente/VerInfoCliente.jsx';
import Editarcliente from '../Cliente/Editarcliente.jsx';
import { useSearchParams } from 'react-router-dom';



const getClientInitials = (name = '') => {
  const nameParts = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.slice(0, 2).map((part) => part.charAt(0)).join('');
  return initials.toUpperCase() || 'CL';
};

const Cliente = () => {
  const { loading } = useAuth();
  const { clientes, eliminarCliente } = useCliente();
  const [searchParams] = useSearchParams();
  // Controlan la apertura de modales de ver informacion y editar.
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editingCliente, setEditingCliente] = useState(null);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  if (loading) return 'Cargando...';

  const clientesFiltrados = !query
    ? clientes
    : clientes.filter((cliente) => {
      const nombre = String(cliente.nombre ?? '').toLowerCase();
      const identificacion = String(cliente.identificacion ?? '').toLowerCase();
      return nombre.includes(query) || identificacion.includes(query);
    });

  return (
    <div className={styles.wrapper}>

      <div className={styles.divAddCliente}>
        <Agregarcliente />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Identificacion</th>
              <th>Direccion</th>
              <th>Celular</th>
              <th>Informacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className={styles.clientCell}>
                    <span className={styles.clientAvatar}>{getClientInitials(cliente.nombre)}</span>
                    <span>{cliente.nombre}</span>
                  </div>
                </td>
                <td>{cliente.identificacion}</td>
                <td>{cliente.direccion}</td>
                <td>{cliente.celular}</td>
                <td>
                  <button
                    onClick={() => setSelectedCliente(cliente)}
                    className={`${styles.iconOnlyButton} ${styles.infoButton}`}
                  >
                    <svg
                      className={`${styles.iconButton} ${styles.ver}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5.25" />
                      <circle cx="12" cy="7.75" r=".75" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditingCliente(cliente)}
                    className={`${styles.actionButton} ${styles.editActionButton}`}
                    aria-label={`Editar cliente ${cliente.nombre}`}
                    title="Editar cliente"
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarCliente(cliente.id)}
                    className={`${styles.actionButton} ${styles.deleteActionButton}`}
                    aria-label={`Eliminar cliente ${cliente.nombre}`}
                    title="Eliminar cliente"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCliente && (
        <VerInfoCliente
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}

      {editingCliente && (
        <Editarcliente
          cliente={editingCliente}
          onClose={() => setEditingCliente(null)}
        />
      )}
    </div>
  );
};

export default Cliente;

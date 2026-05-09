import { useState } from 'react';
import useCliente from '../../hooks/useCliente.jsx';
import styles from '../Cliente/cliente.module.css';
import useAuth from '../../hooks/useAuth.jsx';
import Agregarcliente from '../Cliente/Agregarcliente.jsx';
import VerInfoCliente from '../Cliente/VerInfoCliente.jsx';
import Editarcliente from '../Cliente/Editarcliente.jsx';
import { useSearchParams } from 'react-router-dom';


const getWhatsAppPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`;
  return digits;
};

const openWhatsAppChat = (cliente) => {
  const phone = getWhatsAppPhone(cliente?.celular);
  if (!phone) return;

  const message = encodeURIComponent(`Hola ${cliente?.nombre ?? ''}, `);
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
};

const Cliente = () => {
  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';

  const { clientes, eliminarCliente } = useCliente();
  const [searchParams] = useSearchParams();
  // Controlan la apertura de modales de ver informacion y editar.
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editingCliente, setEditingCliente] = useState(null);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

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
                <td>{cliente.nombre}</td>
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
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25V19.5a2.25 2.25 0 0 1-2.25 2.25h-10.5A2.25 2.25 0 0 1 4.5 19.5V4.5A2.25 2.25 0 0 1 6.75 2.25h6L19.5 8.25z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 2.25v6h6" />
                    </svg>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => openWhatsAppChat(cliente)}
                    className={`${styles.iconOnlyButton} ${styles.whatsappButton}`}
                    disabled={!getWhatsAppPhone(cliente.celular)}
                    title={`Abrir WhatsApp con ${cliente.celular || 'este cliente'}`}
                    aria-label={`Abrir WhatsApp con ${cliente.nombre}`}
                  >
                    <svg className={`${styles.iconButton} ${styles.whatsappIcon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
                      <path d="M16.02 3.2A12.68 12.68 0 0 0 5.3 22.65L4 29l6.5-1.27A12.68 12.68 0 1 0 16.02 3.2Zm0 22.9c-1.92 0-3.78-.53-5.42-1.54l-.39-.23-3.85.75.77-3.76-.25-.4a10.17 10.17 0 1 1 9.14 5.18Zm5.58-7.62c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.68.15-.2.3-.78.99-.96 1.19-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.64-.93-2.25-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.05-1.45.25-.71.25-1.32.18-1.45-.08-.13-.28-.2-.58-.35Z" />
                    </svg>
                  </button>

                  <button onClick={() => setEditingCliente(cliente)} className={styles.iconOnlyButton}>
                    <svg className={`${styles.iconButton} ${styles.editar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                      <path className={`${styles.colorimgg} ${styles.editar}`} d="M200-200h43.92l427.93-427.92-43.93-43.93L200-243.92V-200Zm-40 40v-100.77l527.23-527.77q6.15-5.48 13.57-8.47 7.43-2.99 15.49-2.99t15.62 2.54q7.55 2.54 13.94 9.15l42.69 42.93q6.61 6.38 9.04 14 2.42 7.63 2.42 15.25 0 8.13-2.74 15.56-2.74 7.42-8.72 13.57L260.77-160H160Zm600.77-556.31-44.46-44.46 44.46 44.46ZM649.5-649.5l-21.58-22.35 43.93 43.93-22.35-21.58Z" />
                    </svg>
                  </button>

                  <button onClick={() => eliminarCliente(cliente.id)} className={styles.iconOnlyButton}>
                    <svg className={`${styles.iconButton} ${styles.eliminar}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                      <path className={`${styles.colorimgg} ${styles.eliminar}`} d="M312-172q-25 0-42.5-17.5T252-232v-488h-40v-28h148v-28h240v28h148v28h-40v488q0 26-17 43t-43 17H312Zm368-548H280v488q0 14 9 23t23 9h336q12 0 22-10t10-22v-488ZM402-280h28v-360h-28v360Zm128 0h28v-360h-28v360ZM280-720v520-520Z" />
                    </svg>
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

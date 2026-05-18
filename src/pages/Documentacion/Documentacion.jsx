import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.jsx';
import useCliente from '../../hooks/useCliente.jsx';
import BotonVerde from '../../components/BotonVerde.jsx';
import { createDocumento, deleteDocumento, downloadDocumento, getDocumentos } from '../../services/documentacionService.js';
import styles from './documentacion.module.css';

const initialFormData = {
    clienteId: '',
    nombreCliente: '',
    cedula: '',
    fechaContrato: '',
    archivo: null,
};

const normalizeSearchText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();


const getClientInitials = (name = '') => {
    const nameParts = String(name).trim().split(/\s+/).filter(Boolean);
    const initials = nameParts.slice(0, 2).map((part) => part.charAt(0)).join('');
    return initials.toUpperCase() || 'CL';
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

const getDocumentoId = (documento) => documento?.id ?? documento?._id;

const getClienteId = (cliente) => cliente?.id ?? cliente?._id;

const getDocumentoClienteId = (documento) => documento?.clienteId ?? getClienteId(documento?.cliente);

const getSyncedDocumentoCliente = (documento, clientesById) => {
    const clienteId = getDocumentoClienteId(documento);
    if (!clienteId) return documento?.cliente ?? null;
    return clientesById.get(String(clienteId)) ?? documento?.cliente ?? null;
};

const getDocumentoClientSearchText = (documento, clientesById) => {
    const clienteActualizado = getSyncedDocumentoCliente(documento, clientesById);
    const nombreCliente = clienteActualizado?.nombre
        ?? documento?.nombreCliente
        ?? documento?.cliente?.nombre
        ?? documento?.clienteNombre
        ?? documento?.nombre
        ?? '';
    const cedulaCliente = clienteActualizado?.identificacion
        ?? documento?.cedula
        ?? documento?.cliente?.identificacion
        ?? documento?.identificacion
        ?? documento?.identificacionCliente
        ?? documento?.cedulaCliente
        ?? '';

    return normalizeSearchText(`${nombreCliente} ${cedulaCliente}`);
};

const getArchivoNombre = (documento) => documento?.archivoNombre
    ?? documento?.nombreArchivo
    ?? documento?.fileName
    ?? 'Contrato firmado';

const formatDateOnly = (dateValue) => {
    if (!dateValue) return '';
    const dateString = String(dateValue).slice(0, 10);
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateValue;
    return `${day}/${month}/${year}`;
};

const downloadBlobFile = ({ blob, fileName }) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const Documentacion = () => {
    const { loading, config } = useAuth();
    const { clientes } = useCliente();
    const [documentos, setDocumentos] = useState([]);
    const [isLoadingDocumentos, setIsLoadingDocumentos] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [searchParams] = useSearchParams();
    const clientesById = useMemo(() => new Map(
        clientes.map((cliente) => [String(getClienteId(cliente)), cliente])
    ), [clientes]);

    const query = normalizeSearchText(searchParams.get('q') ?? '');

    const documentosFiltrados = useMemo(() => {
        if (!query) return documentos;
        const queryTerms = query.split(/\s+/).filter(Boolean);

        return documentos.filter((documento) => {
            const searchableClientText = getDocumentoClientSearchText(documento, clientesById);
            return queryTerms.every((term) => searchableClientText.includes(term));
        });
    }, [clientesById, documentos, query]);

    const consultarDocumentos = useCallback(async () => {
        try {
            setIsLoadingDocumentos(true);
            const data = await getDocumentos({ config });
            setDocumentos(Array.isArray(data) ? data : data?.documentos ?? []);
        } catch (error) {
            console.error('Error al consultar documentación:', error);
            Swal.fire({
                title: 'No se pudo consultar documentación',
                text: 'Verifica que el backend tenga habilitado el módulo de documentación.',
                icon: 'warning',
            });
        } finally {
            setIsLoadingDocumentos(false);
        }
    }, [config]);

    useEffect(() => {
        if (!loading) consultarDocumentos();
    }, [loading, consultarDocumentos]);

    const resetForm = () => setFormData(initialFormData);

    const handleClose = () => {
        resetForm();
        setShowModal(false);
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleClienteChange = (event) => {
        const selectedClienteId = event.target.value;
        const selectedCliente = clientes.find((cliente) => String(getClienteId(cliente)) === selectedClienteId);

        setFormData((prev) => ({
            ...prev,
            clienteId: selectedClienteId,
            nombreCliente: selectedCliente?.nombre ?? '',
            cedula: selectedCliente?.identificacion ?? '',
        }));
    };

    const validateForm = () => {
        if (!formData.nombreCliente.trim()) return 'El nombre del cliente es obligatorio.';
        if (!formData.cedula.trim()) return 'La cédula es obligatoria.';
        if (!formData.fechaContrato) return 'La fecha de contrato es obligatoria.';
        if (!formData.archivo) return 'Debes seleccionar el contrato escaneado.';
        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            Swal.fire({ title: 'Campos incompletos', text: validationError, icon: 'warning' });
            return;
        }

        try {
            setIsSaving(true);
            const response = await createDocumento({ documentoPayload: formData, config });
            const savedDocumento = response?.documento ?? response;
            setDocumentos((prev) => [savedDocumento, ...prev]);
            handleClose();
            Swal.fire({
                title: 'Documento guardado',
                text: response?.message || 'El contrato firmado se subió correctamente.',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'No se pudo guardar',
                text: error?.response?.data?.message || 'Verifica el backend e intenta nuevamente.',
                icon: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async (documento) => {
        const documentoId = getDocumentoId(documento);
        if (!documentoId) return;

        try {
            setDownloadingId(documentoId);
            const blob = await downloadDocumento({ documentoId, config });
            downloadBlobFile({ blob, fileName: getArchivoNombre(documento) });
        } catch (error) {
            Swal.fire({
                title: 'No se pudo descargar',
                text: error?.response?.data?.message || 'Intenta nuevamente.',
                icon: 'warning',
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (documento) => {
        const documentoId = getDocumentoId(documento);
        if (!documentoId) return;

        const confirmacion = await Swal.fire({
            title: '¿Eliminar documento?',
            text: 'Esta acción eliminará el registro y el archivo asociado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'confirmarBoton',
                cancelButton: 'cancelBoton',
            },
        });

        if (!confirmacion.isConfirmed) return;

        try {
            setDeletingId(documentoId);
            const response = await deleteDocumento({ documentoId, config });
            setDocumentos((prev) => prev.filter((item) => getDocumentoId(item) !== documentoId));
            Swal.fire({
                title: 'Documento eliminado',
                text: response?.message || 'El documento se eliminó correctamente.',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'No se pudo eliminar',
                text: error?.response?.data?.message || 'Intenta nuevamente.',
                icon: 'error',
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return 'Cargando...';

    return (
        <div className={styles.wrapper}>
            <div className={styles.divAddDocumentacion}>
                <BotonVerde text="Subir contrato" onClick={() => setShowModal(true)} />
            </div>

            <section className={styles.documentsSection}>
                <div className={styles.documentsHeader}>
                    <h3>{documentosFiltrados.length} documentos</h3>
                </div>

                <div className={styles.documentsGrid}>
                    {isLoadingDocumentos ? (
                        <p className={styles.emptyCell}>Cargando documentos...</p>
                    ) : documentosFiltrados.length ? documentosFiltrados.map((documento) => {
                        const documentoId = getDocumentoId(documento);
                        const clienteActualizado = getSyncedDocumentoCliente(documento, clientesById);
                        const nombreCliente = clienteActualizado?.nombre ?? documento.nombreCliente ?? documento.cliente?.nombre;
                        const cedulaCliente = clienteActualizado?.identificacion ?? documento.cedula ?? documento.cliente?.identificacion;
                        return (
                            <article key={documentoId} className={styles.documentCard}>
                                <div className={styles.documentHeader}>
                                    <span className={styles.clientAvatar}>{getClientInitials(nombreCliente)}</span>
                                    <div className={styles.clientInfo}>
                                        <h4 className={styles.clientName}>{nombreCliente}</h4>
                                        <p className={styles.clientCedula}>C.C. {cedulaCliente}</p>
                                    </div>
                                </div>

                                <div className={styles.contractDateCell}>
                                    {renderCalendarIcon(styles.contractDateIcon)}
                                    <span>{formatDateOnly(documento.fechaContrato)}</span>
                                </div>
                                <p className={styles.fileNameText}>{getArchivoNombre(documento)}</p>

                                <div className={styles.cardActions}>
                                    <button
                                        type="button"
                                        className={`${styles.iconActionButton} ${styles.downloadIconButton}`}
                                        onClick={() => handleDownload(documento)}
                                        disabled={downloadingId === documentoId || deletingId === documentoId}
                                        aria-label={`Descargar documento de ${nombreCliente ?? 'cliente'}`}
                                        title="Descargar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v11.5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 11.75 4.5 4.5 4.5-4.5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.iconActionButton} ${styles.deleteButton}`}
                                        onClick={() => handleDelete(documento)}
                                        disabled={deletingId === documentoId || downloadingId === documentoId}
                                        aria-label={`Eliminar documento de ${nombreCliente ?? 'cliente'}`}
                                        title="Eliminar documento"
                                    >
                                        {deletingId === documentoId ? '...' : '×'}
                                    </button>
                                </div>
                            </article>
                        );
                    }) : (
                        <p className={styles.emptyCell}>No hay contratos firmados registrados.</p>
                    )}
                </div>
            </section>

            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalDialog}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h5 className={styles.modalTitle}>Subir <span className={styles.modalTitle2}>Contrato</span></h5>
                                    <button type="button" className={styles.btnClose} onClick={handleClose}>x</button>
                                </div>

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className={styles.modalBody}>
                                        <div className={styles.formGrid}>
                                            <select
                                                className={styles.inputFormu}
                                                name="nombreCliente"
                                                value={formData.clienteId}
                                                onChange={handleClienteChange}
                                            >
                                                <option value="">Seleccione un cliente *</option>
                                                {clientes.map((cliente) => {
                                                    const clienteId = getClienteId(cliente);
                                                    return <option key={clienteId} value={clienteId}>{cliente.nombre}</option>;
                                                })}
                                            </select>
                                            <input
                                                className={styles.inputFormu}
                                                name="cedula"
                                                value={formData.cedula}
                                                readOnly
                                                placeholder="Cédula *"
                                            />
                                            <input
                                                className={styles.inputFormu}
                                                name="fechaContrato"
                                                type="date"
                                                value={formData.fechaContrato}
                                                onChange={handleChange}
                                            />
                                            <input
                                                className={styles.inputFormu}
                                                name="archivo"
                                                type="file"
                                                accept=".pdf,.doc,.docx,image/*"
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.modalFooter}>
                                        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleClose}>Cancelar</button>
                                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
                                            {isSaving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documentacion;

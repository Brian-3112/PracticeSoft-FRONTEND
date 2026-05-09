import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.jsx';
import BotonVerde from '../../components/BotonVerde.jsx';
import { createDocumento, downloadDocumento, getDocumentos } from '../../services/documentacionService.js';
import styles from './documentacion.module.css';

const initialFormData = {
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

const getDocumentoId = (documento) => documento?.id ?? documento?._id;

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
    const [documentos, setDocumentos] = useState([]);
    const [isLoadingDocumentos, setIsLoadingDocumentos] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [searchParams] = useSearchParams();

    const query = normalizeSearchText(searchParams.get('q') ?? '');

    const documentosFiltrados = useMemo(() => {
        if (!query) return documentos;

        return documentos.filter((documento) => {
            const nombreCliente = normalizeSearchText(documento.nombreCliente ?? documento.cliente?.nombre ?? '');
            const cedula = normalizeSearchText(documento.cedula ?? documento.cliente?.identificacion ?? '');
            const fechaContrato = normalizeSearchText(documento.fechaContrato ?? '');
            return nombreCliente.includes(query)
                || cedula.includes(query)
                || fechaContrato.includes(query);
        });
    }, [documentos, query]);

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

    if (loading) return 'Cargando...';

    return (
        <div className={styles.wrapper}>
            <div className={styles.divAddDocumentacion}>
                <BotonVerde text="Subir contrato" onClick={() => setShowModal(true)} />
            </div>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>{documentosFiltrados.length} documentos</h3>
                    <p>Contratos firmados y escaneados</p>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Cédula</th>
                                <th>Fecha de contrato</th>
                                <th>Archivo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingDocumentos ? (
                                <tr><td colSpan="5" className={styles.emptyCell}>Cargando documentos...</td></tr>
                            ) : documentosFiltrados.length ? documentosFiltrados.map((documento) => {
                                const documentoId = getDocumentoId(documento);
                                return (
                                    <tr key={documentoId}>
                                        <td>{documento.nombreCliente ?? documento.cliente?.nombre}</td>
                                        <td>{documento.cedula ?? documento.cliente?.identificacion}</td>
                                        <td>{formatDateOnly(documento.fechaContrato)}</td>
                                        <td>{getArchivoNombre(documento)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`${styles.btn} ${styles.btnPrimary}`}
                                                onClick={() => handleDownload(documento)}
                                                disabled={downloadingId === documentoId}
                                            >
                                                {downloadingId === documentoId ? 'Descargando...' : 'Descargar'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="5" className={styles.emptyCell}>No hay contratos firmados registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <div className={styles.modalDialog}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h5 className={styles.modalTitle}>Subir <span className={styles.modalTitle2}>Contrato Firmado</span></h5>
                                    <button type="button" className={styles.btnClose} onClick={handleClose}>x</button>
                                </div>

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className={styles.modalBody}>
                                        <div className={styles.formGrid}>
                                            <label className={styles.labelFormu}>
                                                Nombre del cliente *
                                                <input
                                                    className={styles.inputFormu}
                                                    name="nombreCliente"
                                                    value={formData.nombreCliente}
                                                    onChange={handleChange}
                                                    placeholder="Nombre del cliente"
                                                />
                                            </label>
                                            <label className={styles.labelFormu}>
                                                Cédula *
                                                <input
                                                    className={styles.inputFormu}
                                                    name="cedula"
                                                    value={formData.cedula}
                                                    onChange={handleChange}
                                                    placeholder="Cédula"
                                                />
                                            </label>
                                            <label className={styles.labelFormu}>
                                                Fecha de contrato *
                                                <input
                                                    className={styles.inputFormu}
                                                    name="fechaContrato"
                                                    type="date"
                                                    value={formData.fechaContrato}
                                                    onChange={handleChange}
                                                />
                                            </label>
                                            <label className={styles.labelFormu}>
                                                Archivo escaneado *
                                                <input
                                                    className={styles.inputFormu}
                                                    name="archivo"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,image/*"
                                                    onChange={handleChange}
                                                />
                                            </label>
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

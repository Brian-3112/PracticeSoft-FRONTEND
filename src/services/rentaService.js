import clienteAxios from '../config/axios';

export const TIPOS_CONTRATO_RENTA = {
    RENTA: 'renta',
    RESPONSABILIDAD: 'responsabilidad',
    VACIO: 'vacio',
};

const CONTRATO_ENDPOINTS = {
    [TIPOS_CONTRATO_RENTA.RENTA]: 'contrato.docx',
    [TIPOS_CONTRATO_RENTA.RESPONSABILIDAD]: 'contrato-responsabilidad.docx',
    [TIPOS_CONTRATO_RENTA.VACIO]: 'contrato-vacio.docx',
};

const getTipoContrato = ({ tipoContrato, contratoVacio }) => {
    if (contratoVacio) return TIPOS_CONTRATO_RENTA.VACIO;
    return CONTRATO_ENDPOINTS[tipoContrato] ? tipoContrato : TIPOS_CONTRATO_RENTA.RENTA;
};

export const createRenta = async ({ rentaPayload, config }) => {
    const { data } = await clienteAxios.post('/rentas', rentaPayload, config);
    return data;
};

export const downloadContratoDocx = async ({
    rentaId,
    rentaPayload,
    config,
    contratoVacio = false,
    tipoContrato = TIPOS_CONTRATO_RENTA.RENTA,
}) => {
    const selectedTipoContrato = getTipoContrato({ tipoContrato, contratoVacio });

    if (rentaId) {
        const contratoEndpoint = `/rentas/${rentaId}/${CONTRATO_ENDPOINTS[selectedTipoContrato]}`;

        const response = await clienteAxios.get(contratoEndpoint, {
            ...config,
            responseType: 'blob',
        });
        return response.data;
    }

    if (!rentaPayload) {
        throw new Error('No se recibió información para descargar el contrato.');
    }

    const queryParams = new URLSearchParams({ formato: 'docx' });
    if (selectedTipoContrato !== TIPOS_CONTRATO_RENTA.RENTA) {
        queryParams.set('tipoContrato', selectedTipoContrato);
    }

    const response = await clienteAxios.post(`/rentas?${queryParams.toString()}`, rentaPayload, {
        ...config,
        responseType: 'blob',
    });
    return response.data;
};


export const deleteRentaById = async ({ rentaId, config }) => {
    const { data } = await clienteAxios.delete(`/rentas/${rentaId}`, config);
    return data;
};

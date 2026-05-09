import clienteAxios from '../config/axios';

export const createRenta = async ({ rentaPayload, config }) => {
    const { data } = await clienteAxios.post('/rentas', rentaPayload, config);
    return data;
};

export const downloadContratoDocx = async ({ rentaId, rentaPayload, config, sinDatosCliente = false }) => {
    if (rentaId) {
        const response = await clienteAxios.get(`/rentas/${rentaId}/contrato.docx`, {
            ...config,
            params: sinDatosCliente ? { sinDatosCliente: true } : undefined,
            responseType: 'blob',
        });
        return response.data;
    }

    if (!rentaPayload) {
        throw new Error('No se recibió información para descargar el contrato.');
    }

    const response = await clienteAxios.post('/rentas?formato=docx', rentaPayload, {
        ...config,
        responseType: 'blob',
    });
    return response.data;
};


export const deleteRentaById = async ({ rentaId, config }) => {
    const { data } = await clienteAxios.delete(`/rentas/${rentaId}`, config);
    return data;
};

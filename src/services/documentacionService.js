import clienteAxios from '../config/axios';

export const getDocumentos = async ({ config }) => {
    const { data } = await clienteAxios.get('/documentacion', config);
    return data;
};

export const createDocumento = async ({ documentoPayload, config }) => {
    const formData = new FormData();
    formData.append('nombreCliente', documentoPayload.nombreCliente);
    formData.append('cedula', documentoPayload.cedula);
    formData.append('fechaContrato', documentoPayload.fechaContrato);
    formData.append('archivo', documentoPayload.archivo);

    const { data } = await clienteAxios.post('/documentacion', formData, {
        ...config,
        headers: {
            ...config?.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const downloadDocumento = async ({ documentoId, config }) => {
    const response = await clienteAxios.get(`/documentacion/${documentoId}/archivo`, {
        ...config,
        responseType: 'blob',
    });
    return response.data;
};


export const deleteDocumento = async ({ documentoId, config }) => {
    const { data } = await clienteAxios.delete(`/documentacion/${documentoId}`, config);
    return data;
};

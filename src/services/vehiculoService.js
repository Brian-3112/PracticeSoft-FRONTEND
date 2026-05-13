import clienteAxios from '../config/axios';

const SUBARRIENDO_CONTRATO_ENDPOINT = 'contrato-subarriendo.docx';

export const downloadContratoSubarriendoDocx = async ({
    vehiculoId,
    vehiculoPayload,
    config,
}) => {
    if (!vehiculoPayload) {
        throw new Error('No se recibió información para descargar el contrato de subarriendo.');
    }

    const endpoint = vehiculoId
        ? `/vehiculos/${vehiculoId}/${SUBARRIENDO_CONTRATO_ENDPOINT}`
        : `/vehiculos/${SUBARRIENDO_CONTRATO_ENDPOINT}`;

    const response = await clienteAxios.post(endpoint, vehiculoPayload, {
        ...config,
        responseType: 'blob',
    });

    return response.data;
};

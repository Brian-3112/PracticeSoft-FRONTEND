import clienteAxios from '../config/axios';

const SUBARRIENDO_CONTRATO_ENDPOINT = 'contrato-subarriendo.docx';

export const downloadContratoSubarriendoDocx = async ({
    vehiculoId,
    vehiculoPayload,
    config,
}) => {
    if (!vehiculoId) {
        throw new Error('No se recibió el vehículo para descargar el contrato de subarriendo.');
    }

    const response = await clienteAxios.post(
        `/vehiculos/${vehiculoId}/${SUBARRIENDO_CONTRATO_ENDPOINT}`,
        vehiculoPayload,
        {
            ...config,
            responseType: 'blob',
        }
    );

    return response.data;
};

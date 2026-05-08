import clienteAxios from '../config/axios';

export const createRenta = async ({ rentaPayload, config }) => {
    const { data } = await clienteAxios.post('/rentas', rentaPayload, config);
    return data;
};

export const downloadContratoDocx = async ({ rentaId, rentaPayload, config }) => {
    if (rentaId) {
        const response = await clienteAxios.get(`/rentas/${rentaId}/contrato.docx`, {
            ...config,
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


const contratoLimpioHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Contrato limpio de alquiler</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111827; line-height: 1.55; }
        h1 { text-align: center; font-size: 20px; text-transform: uppercase; }
        h2 { font-size: 15px; margin-top: 24px; }
        .field { margin: 10px 0; }
        .line { display: inline-block; min-width: 260px; border-bottom: 1px solid #111827; }
        .signatures { display: table; width: 100%; margin-top: 56px; }
        .signature { display: table-cell; width: 50%; text-align: center; padding: 0 20px; }
        .signature-line { border-top: 1px solid #111827; padding-top: 8px; }
    </style>
</head>
<body>
    <h1>Contrato básico de alquiler de vehículo</h1>

    <p>
        Entre los suscritos, por una parte <span class="line">&nbsp;</span>, identificado(a) con
        <span class="line">&nbsp;</span>, quien en adelante se denominará EL ARRENDADOR, y por otra parte
        <span class="line">&nbsp;</span>, identificado(a) con <span class="line">&nbsp;</span>, quien en adelante
        se denominará EL ARRENDATARIO, se celebra el presente contrato de alquiler de vehículo.
    </p>

    <h2>1. Datos del vehículo</h2>
    <p class="field">Vehículo: <span class="line">&nbsp;</span></p>
    <p class="field">Placa: <span class="line">&nbsp;</span></p>
    <p class="field">Color / modelo: <span class="line">&nbsp;</span></p>

    <h2>2. Duración del alquiler</h2>
    <p class="field">Fecha y hora de entrega: <span class="line">&nbsp;</span></p>
    <p class="field">Fecha y hora de devolución: <span class="line">&nbsp;</span></p>

    <h2>3. Valor del alquiler</h2>
    <p class="field">Valor diario: <span class="line">&nbsp;</span></p>
    <p class="field">Valor total: <span class="line">&nbsp;</span></p>

    <h2>4. Obligaciones básicas</h2>
    <p>
        EL ARRENDATARIO recibe el vehículo en buen estado y se compromete a devolverlo en las mismas
        condiciones, salvo el desgaste normal por uso. EL ARRENDATARIO responderá por comparendos,
        daños, pérdidas o gastos ocasionados durante el tiempo de alquiler.
    </p>

    <h2>5. Observaciones</h2>
    <p><span class="line">&nbsp;</span></p>
    <p><span class="line">&nbsp;</span></p>
    <p><span class="line">&nbsp;</span></p>

    <p class="field">Ciudad y fecha: <span class="line">&nbsp;</span></p>

    <div class="signatures">
        <div class="signature">
            <div class="signature-line">Firma arrendador</div>
        </div>
        <div class="signature">
            <div class="signature-line">Firma arrendatario</div>
        </div>
    </div>
</body>
</html>
`;

export const downloadContratoLimpio = () => {
    const blob = new Blob(['\ufeff', contratoLimpioHtml], {
        type: 'application/msword;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contrato-limpio-renta.doc');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

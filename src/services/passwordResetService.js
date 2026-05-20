import clienteAxios from '../config/axios.jsx';

const shouldTryNextEndpoint = (error) => [404, 405].includes(error?.response?.status);

const getBackendMessage = (error) => (
    error?.response?.data?.message
    || error?.response?.data?.msg
    || error?.response?.data?.error
    || error?.message
    || 'Error desconocido'
);

const createPasswordResetError = ({ error, endpoint, title }) => {
    const status = error?.response?.status;
    const isBackendError = Boolean(error?.response);
    const isNetworkError = !error?.response && Boolean(error?.request);

    return {
        title: isNetworkError ? 'No hay respuesta del servidor' : title,
        message: isBackendError
            ? getBackendMessage(error)
            : 'No se pudo conectar con el backend. Revisa que el servidor esté encendido y que VITE_BACKEND_URL sea correcto.',
        detail: isBackendError
            ? `Backend respondió HTTP ${status} en ${endpoint}.`
            : `Sin respuesta desde ${clienteAxios.defaults.baseURL}${endpoint}.`,
        isBackendError,
        isNetworkError,
        status,
        endpoint,
        originalError: error,
    };
};

const postWithFallback = async ({ endpoints, payload, errorTitle }) => {
    let lastError;
    let lastEndpoint;

    for (const endpoint of endpoints) {
        try {
            return await clienteAxios.post(endpoint, payload);
        } catch (error) {
            lastError = error;
            lastEndpoint = endpoint;

            if (!shouldTryNextEndpoint(error)) break;
        }
    }

    throw createPasswordResetError({ error: lastError, endpoint: lastEndpoint, title: errorTitle });
};

export const requestPasswordReset = ({ email, resetUrl }) => postWithFallback({
    endpoints: [
        '/usuarios/forgot-password',
        '/usuarios/olvide-password',
        '/forgot-password',
        '/olvide-password',
    ],
    payload: {
        email,
        resetUrl,
        resetPasswordUrl: resetUrl,
        frontendResetUrl: resetUrl,
    },
    errorTitle: 'No se pudo enviar el enlace',
});

export const updatePasswordWithToken = ({ token, password }) => postWithFallback({
    endpoints: [
        '/usuarios/reset-password',
        `/usuarios/reset-password/${token}`,
        '/reset-password',
        `/reset-password/${token}`,
        `/usuarios/nuevo-password/${token}`,
        `/nuevo-password/${token}`,
    ],
    payload: { token, password },
    errorTitle: 'No se pudo restablecer',
});

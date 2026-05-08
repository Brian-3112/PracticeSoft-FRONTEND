import clienteAxios from '../config/axios.jsx';

const shouldTryNextEndpoint = (error) => [404, 405].includes(error?.response?.status);

const getBackendMessage = (error) => (
    error?.response?.data?.message
    || error?.response?.data?.msg
    || error?.response?.data?.error
    || error?.message
    || 'Error desconocido'
);

const createUserSettingsError = ({ error, endpoint }) => {
    const status = error?.response?.status;
    const isBackendError = Boolean(error?.response);
    const isNetworkError = !error?.response && Boolean(error?.request);

    return {
        title: isNetworkError ? 'No hay respuesta del servidor' : 'No se pudo cambiar la contraseña',
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

const putWithFallback = async ({ endpoints, payload, config }) => {
    let lastError;
    let lastEndpoint;

    for (const endpoint of endpoints) {
        try {
            return await clienteAxios.put(endpoint, payload, config);
        } catch (error) {
            lastError = error;
            lastEndpoint = endpoint;

            if (!shouldTryNextEndpoint(error)) break;
        }
    }

    throw createUserSettingsError({ error: lastError, endpoint: lastEndpoint });
};

export const changeUserPassword = ({ currentPassword, newPassword }, config) => putWithFallback({
    endpoints: [
        '/usuarios/cambiar-password',
        '/usuarios/change-password',
        '/usuarios/password',
        '/change-password',
    ],
    payload: {
        currentPassword,
        passwordActual: currentPassword,
        newPassword,
        nuevaPassword: newPassword,
        password: newPassword,
    },
    config,
});

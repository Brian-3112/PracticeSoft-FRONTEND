import clienteAxios from '../config/axios.jsx';

export const createTemporaryUser = async (payload, config) => {
  const { data } = await clienteAxios.post('/usuarios/temporales', payload, config);
  return data;
};

export const getTemporaryUsers = async (config) => {
  const { data } = await clienteAxios.get('/usuarios/temporales', config);
  return data;
};

export const updateTemporaryUserPassword = async (id, payload, config) => {
  const { data } = await clienteAxios.patch(`/usuarios/temporales/${id}/password`, payload, config);
  return data;
};

export const updateTemporaryUserStatus = async (id, payload, config) => {
  const { data } = await clienteAxios.patch(`/usuarios/temporales/${id}/status`, payload, config);
  return data;
};


export const deleteTemporaryUser = async (id, config) => {
  const { data } = await clienteAxios.delete(`/usuarios/temporales/${id}`, config);
  return data;
};

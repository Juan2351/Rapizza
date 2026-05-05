import api from './api';

export const authService = {
  login: async (usuario, password) => {
    const res = await api.post('/auth/login', { usuario, password });
    return res.data.data; // { token, usuario, rol, imagen, id }
  },

  register: async (usuario, password, rol = 'usuario') => {
    const res = await api.post('/auth/register', { usuario, password, rol });
    return res.data.data;
  },

  me: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Interceptador para adicionar o token JWT em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptador para lidar com refresh token ou erros de expiração
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
          localStorage.setItem('access_token', res.data.access);
          api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (e) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const parseApiError = (err: any, defaultMsg: string = 'Ocorreu um erro.') => {
  if (err.code === 'ERR_NETWORK') {
    return 'Erro de conexão: O servidor não está respondendo.';
  }

  if (err.response?.data) {
    const errorData = err.response.data;
    if (typeof errorData === 'string') return errorData;
    if (errorData.detail) return errorData.detail;
    
    const fieldNames: {[key: string]: string} = {
      cpf: 'CPF', rg: 'RG', email: 'E-mail', name: 'Nome',
      birth_date: 'Data de Nascimento', cep: 'CEP', phone: 'Telefone',
      phones: 'Telefones', username: 'Usuário', password: 'Senha',
      file: 'Arquivo'
    };

    if (typeof errorData === 'object') {
      return Object.entries(errorData)
        .map(([field, msgs]: any) => {
          const label = fieldNames[field] || field;
          const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          return `${label}: ${message}`;
        })
        .join(' | ');
    }
  }

  return defaultMsg;
};

export default api;

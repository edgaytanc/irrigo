import axios from 'axios';

// **CORRECCIÓN CLAVE AQUÍ**
// La URL base debe ser relativa para que el proxy funcione.
const api = axios.create({
  baseURL: '/api', 
});

// Interceptor para añadir el token a las cabeceras de las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
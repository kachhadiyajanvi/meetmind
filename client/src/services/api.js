import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'https://meetmind-cj0u.onrender.com/api';

const api = axios.create({
    baseURL: base,
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

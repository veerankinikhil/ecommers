import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5050/api';
export const SOCKET_BASE_URL = 'http://localhost:5050';

const adminApi = axios.create({
  baseURL: API_BASE_URL
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('novakart_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export default adminApi;

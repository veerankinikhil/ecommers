import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5050/api';
export const SOCKET_BASE_URL = 'http://localhost:5050';

const paymentApi = axios.create({
  baseURL: API_BASE_URL
});

paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('novakart_finance_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export default paymentApi;

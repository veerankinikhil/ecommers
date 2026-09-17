import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5050/api';
export const SOCKET_BASE_URL = 'http://localhost:5050';

const sellerApi = axios.create({
  baseURL: API_BASE_URL
});

sellerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('novakart_seller_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export default sellerApi;

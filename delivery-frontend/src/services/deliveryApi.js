import axios from 'axios';

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

let apiHost = isHttps ? window.location.origin : `http://${hostname}:5050`;
if (hostname.includes('loca.lt')) {
  apiHost = 'https://cruel-llamas-build.loca.lt';
}

export const API_BASE_URL = isHttps ? '/api' : `${apiHost}/api`;
export const SOCKET_BASE_URL = apiHost;


const deliveryApi = axios.create({
  baseURL: API_BASE_URL
});

deliveryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('novakart_delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

export default deliveryApi;

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_CONFIG, DEFAULT_HEADERS, } from '@/constants/api';

const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: DEFAULT_HEADERS,
  withCredentials: false,
});

axiosClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data,
      timeout: config.timeout,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });
    return Promise.reject(error);
  },
);

export { axiosClient };
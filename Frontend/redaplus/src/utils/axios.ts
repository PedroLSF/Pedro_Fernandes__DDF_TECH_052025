import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { jwtDecode, STORAGE_KEY, tokenExpired } from '../auth/context/jwt/utils';

// ----------------------------------------------------------------------

axios.defaults.baseURL = HOST_API;
const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Ops! Algo deu errado')
);

export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEY, accessToken);

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server

    tokenExpired(exp * 1000);
  } else {
    localStorage.removeItem(STORAGE_KEY);

    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/auth/me',
    login: '/auth/login',
    refresh: '/auth/refresh-token',
    register: '/api/auth/register',
  },

  user: {
    list: '/user',
    post: '/user',
    get: (id: string) => `/user/${id}`,
    update: (id: string) => `/user/${id}`,
    delete: (id: string) => `/user/${id}`,
  },
  essay: {
    list: '/essay',
    post: '/essay',
    get: (id: string) => `/essay/${id}`,
    update: (id: string) => `/essay/${id}`,
    delete: (id: string) => `/essay/${id}`,
  },
  planning: {
    list: '/planning',
    post: '/planning',
    get: (id: string) => `/planning/${id}`,
    update: (id: string) => `/planning/${id}`,
    delete: (id: string) => `/planning/${id}`,
  },
  dashboard: {
    essaysPerMonth: '/essay/essay-per-month',
    essaysPerTheme: '/essay/essay-per-theme',
    essaysPerStatus: 'essay/essay-per-status',
    essaysAvg: 'essay/essay-avg-note',
    planningPerMonth: 'planning/planning-per-month',
  },
};

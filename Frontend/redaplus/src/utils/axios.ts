import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

import { currentEntityIdNullKey, currentEntityIdStorageKey } from '../types/general';
import {
  jwtDecode,
  STORAGE_KEY,
  tokenExpired,
  STORAGE_KEY_REFRESH,
} from '../auth/context/jwt/utils';
import DashboardDeviceVisualization from 'src/sections/dashboard/dashboard-device-visualization';

// ----------------------------------------------------------------------

axios.defaults.baseURL = HOST_API;
const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem(STORAGE_KEY);
    const currentEntity = localStorage.getItem(currentEntityIdStorageKey);

    try {
      if (accessToken) {
        const { exp } = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        // Less than "exp - currentTime", but you have to be logged to refresh
        if (exp - currentTime < 300 && exp - currentTime > 0) {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        }
        if (currentEntity !== currentEntityIdNullKey) {
          config.headers['X-Current-Entity-Id'] = currentEntity;
        }
        return config;
      }
    } catch (error) {
      console.error(error);
    }

    if (currentEntity !== currentEntityIdNullKey) {
      config.headers['X-Current-Entity-Id'] = currentEntity;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Ops! Algo deu errado')
);

export const setSession = (accessToken: string | null, refreshToken?: string | null) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
    }

    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server

    tokenExpired(exp * 1000);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_REFRESH);

    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

export const getRefreshToken = () => localStorage.getItem(STORAGE_KEY_REFRESH);

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  // Use axios, to avoid loop
  const res = await axios.post(endpoints.auth.refresh, { refresh_token: refreshToken });

  const { access_token: newAccessToken } = res.data.tokens;

  setSession(newAccessToken, refreshToken);
  return newAccessToken;
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
  dashboard: {
    essaysPerMonth: '/essay/essay-per-month',
    essaysPerTheme: '/essay/essay-per-theme',
  },
};

import { useRef } from 'react';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import axiosInstance from '../utils/axios';

const generateUniqueKey = (endpoint: string, params: any, considerParamsInKey: boolean) => {
  if (considerParamsInKey) {
    // Se a flag considerar os parâmetros, gera a chave única incluindo os parâmetros
    const paramString = new URLSearchParams(params).toString();
    return `${endpoint}?${paramString}`;
  }
  // Caso contrário, gera a chave apenas com a URL base
  return endpoint;
};

export function useCancelableAxios() {
  // Armazena controladores de requisição por rota (endpoint)
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  const fetchWithCancel = async (
    endpoint: string,
    config: AxiosRequestConfig = {},
    considerParamsInKey: boolean = false
    // eslint-disable-next-line consistent-return
  ) => {
    const uniqueKey = generateUniqueKey(endpoint, config.params, considerParamsInKey);
    // Se já existe uma requisição ativa para esse endpoint, cancela antes de iniciar outra
    if (controllersRef.current.has(uniqueKey)) {
      controllersRef.current.get(uniqueKey)?.abort();
    }

    // Cria um novo controlador e armazena pelo uniqueKey
    const controller = new AbortController();
    controllersRef.current.set(uniqueKey, controller);
    const { signal } = controller;

    try {
      const response: AxiosResponse<any> = await axiosInstance({
        ...config,
        url: endpoint,
        signal,
      });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`Requisição cancelada para ${uniqueKey}`);
      } else {
        if (error.response && error.response.status === 401) {
          console.error('Token expirado ou não autorizado. Tente logar novamente.');
        }
        throw error;
      }
    }
  };

  return { fetchWithCancel };
}

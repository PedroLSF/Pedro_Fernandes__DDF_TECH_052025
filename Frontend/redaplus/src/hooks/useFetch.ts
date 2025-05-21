import useSWR, { type SWRConfiguration } from 'swr';
import { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import axios from '../utils/axios';
import { queryString } from '../utils/fetch';

export default function useFetch<DataType>(
  url: string,
  axiosOptions?: AxiosRequestConfig | null,
  swrOptions?: (SWRConfiguration | null) & { forceMsDelayBeforeFetch?: number },
  api?: AxiosInstance
) {
  const safeAxiosOptions = axiosOptions ?? {};
  const safeSwrOptions = swrOptions ?? {};
  const safeApi = api || axios;
  let safeUrl = url;

  if (url && safeAxiosOptions.params) {
    // Default to keep previous data for PAGINATION
    if (safeAxiosOptions.params?.page) {
      safeSwrOptions.keepPreviousData = safeSwrOptions.keepPreviousData ?? true;
    }

    const query = queryString(safeAxiosOptions.params);

    if (query) {
      delete safeAxiosOptions.params;
      safeUrl += `?${query}`;
    }
  }

  return useSWR<DataType>(
    safeUrl,
    async (uri: string) =>
      safeApi?.get?.(uri, axiosOptions as AxiosRequestConfig).then((response) => response.data),
    swrOptions
  );
}

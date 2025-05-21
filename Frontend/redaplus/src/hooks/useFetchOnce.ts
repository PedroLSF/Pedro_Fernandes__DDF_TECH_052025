import { type SWRConfiguration } from 'swr';
import { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import useFetch from './useFetch';

export default function useFetchOnce<DataType>(
  url: string,
  axiosOptions?: AxiosRequestConfig | null,
  swrOptions?: (SWRConfiguration | null) & { forceMsDelayBeforeFetch?: number },
  api?: AxiosInstance
) {
  return useFetch<DataType>(
    url,
    axiosOptions,
    {
      ...Object(swrOptions),
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
    api
  );
}

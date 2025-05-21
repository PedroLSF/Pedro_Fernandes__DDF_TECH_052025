// import useSWR from 'swr';
// import { useMemo } from 'react';

// import { fetcher, endpoints } from 'src/utils/axios';

// import { IProjectItem } from 'src/types/project';

// export function useGetProject(projectId: string | undefined) {
//   const URL = projectId ? [endpoints.project.get] : '';

//   const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

//   const memoizedValue = useMemo(
//     () => ({
//       project: data?.project as IProjectItem,
//       projectLoading: isLoading,
//       projectError: error,
//       projectValidating: isValidating,
//     }),
//     [data?.project, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

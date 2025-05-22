import { useMemo } from 'react';
import { SweetAlertOptions } from 'sweetalert2';
// eslint-disable-next-line import/extensions
import Swal from 'sweetalert2/dist/sweetalert2.js';
import withReactContent from 'sweetalert2-react-content';

import { useTheme } from '@mui/material/styles';

export type AlertOptions = SweetAlertOptions;

export function useSweetAlert() {
  const SweetAlert = useMemo(() => withReactContent(Swal), []);
  const theme = useTheme();

  const urlAlert = (options: AlertOptions, url: string) =>
    SweetAlert.fire({
      icon: 'success',
      customClass: {
        popup: `theme-${theme.palette.mode}`,
      },
      ...options,
      html: `<a href="${url}" target="_blank">Clique para fazer o download</a>`,
    });

  const successAlert = (options: AlertOptions) =>
    SweetAlert.fire({
      icon: 'success',
      customClass: {
        popup: `theme-${theme.palette.mode}`,
      },
      ...options,
    });

  const errorAlert = (options: AlertOptions) =>
    SweetAlert.fire({
      icon: 'error',
      customClass: {
        popup: `theme-${theme.palette.mode}`,
      },
      ...options,
    });

  return {
    successAlert,
    errorAlert,
    urlAlert,
  };
}

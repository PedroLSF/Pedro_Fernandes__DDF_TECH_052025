import Swal from 'sweetalert2';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const STORAGE_KEY = '@@unyplay-access_token';
export const STORAGE_KEY_REFRESH = '@@unyplay-refresh_token';

export function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

let expiredTimer: NodeJS.Timeout | number | null = null;

export const tokenExpired = (exp: number) => {
  const currentTime = Date.now();

  // Test token expires after 10s
  // const timeLeft = currentTime + 10000 - currentTime; // ~10s
  const timeLeft = exp - currentTime;

  if (expiredTimer) {
    clearTimeout(expiredTimer);
  }

  expiredTimer = setTimeout(() => {
    Swal.fire({
      title: 'Sessão expirada!',
      text: 'Faça login novamente.',
      icon: 'warning',
    });

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_REFRESH);

    window.location.href = paths.auth.jwt.login;
  }, timeLeft);
};

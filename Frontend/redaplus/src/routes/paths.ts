import { _id } from 'src/_mock/assets';
import { ChannelEditTabs } from 'src/_mock/_channel';
// ----------------------------------------------------------------------
const MOCK_ID = _id[1];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

const objParamToQs = (params: Record<string, any>) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgot_password: `${ROOTS.AUTH}/jwt/forgot-password`,
      new_password: `${ROOTS.AUTH}/jwt/new-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    welcome: `${ROOTS.DASHBOARD}/welcome`,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      profile: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/profile`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    essay: {
      root: `${ROOTS.DASHBOARD}/essay/list`,
      new: `${ROOTS.DASHBOARD}/essay/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/essay/${id}`,
    },
    planning: {
      new: `${ROOTS.DASHBOARD}/planning/new`,
    },
  },
};

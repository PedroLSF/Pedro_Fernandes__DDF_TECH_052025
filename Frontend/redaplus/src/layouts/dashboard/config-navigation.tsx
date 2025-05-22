import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  tag: icon('ic_tag'),
  bookmark: icon('ic_bookmark'),
  channel: icon('ic_channel'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const navData = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'Dashboard',
        dataCy: 'dashboard-group',
        items: [
          {
            title: 'Estatísticas',
            dataCy: 'statistics',
            path: paths.dashboard.root,
            icon: ICONS.analytics,
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'Usuários',
        dataCy: 'users-group',
        items: [
          {
            title: 'Usuários',
            path: paths.dashboard.user.list,
            icon: ICONS.user,
            dataCy: 'users',
          },
          {
            title: 'Redações',
            path: paths.dashboard.essay.root,
            icon: ICONS.blog,
            dataCy: 'essay',
          },
          {
            title: 'Planejamneto',
            path: paths.dashboard.planning.new,
            icon: ICONS.mail,
            dataCy: 'essay',
          },
        ],
      },
    ],
    []
  );

  return navData;
}

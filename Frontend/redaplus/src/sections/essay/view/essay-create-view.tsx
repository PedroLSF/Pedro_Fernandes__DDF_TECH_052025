'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EssayNewEditForm from '../essay-new-edit-form';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function EssayCreateView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Usuários"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de usuário',
            href: paths.dashboard.user.list,
          },
          { name: 'Novo usuário' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EssayNewEditForm user={user} />
    </Container>
  );
}

'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EssayNewEditForm from '../essay-new-edit-form';

// ----------------------------------------------------------------------

export default function EssayCreateView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Redações"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de Redações',
            href: paths.dashboard.user.list,
          },
          { name: 'Nova Redação' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EssayNewEditForm user={user} />
    </Container>
  );
}

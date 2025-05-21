'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';
import PlanningNewEditForm from '../planning-new-edit-form';

// ----------------------------------------------------------------------

export default function PlanningCreateView() {
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
          //   {
          //     name: 'Lista de usuário',
          //     href: paths.dashboard.user.list,
          //   },
          { name: 'Novo Planejamento' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlanningNewEditForm user={user} />
    </Container>
  );
}

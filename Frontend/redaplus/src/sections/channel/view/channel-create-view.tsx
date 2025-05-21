'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ChannelNewEditForm from '../channel-new-edit-form';

// ----------------------------------------------------------------------

export default function ChannelCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Criar"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de canais',
            href: paths.dashboard.channel.list,
          },
          { name: 'Nova canal' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ChannelNewEditForm />
    </Container>
  );
}

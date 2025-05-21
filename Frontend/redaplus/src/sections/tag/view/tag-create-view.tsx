'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import TagNewEditForm from '../tag-new-edit-form';

// ----------------------------------------------------------------------

export default function TagCreateView() {
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
            name: 'Lista de Tag',
            href: paths.dashboard.tag.list,
          },
          { name: 'Criar Tag' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TagNewEditForm />
    </Container>
  );
}

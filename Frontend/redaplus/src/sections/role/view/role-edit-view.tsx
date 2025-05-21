'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IRole } from '../../../types/role';
import { endpoints } from '../../../utils/axios';
import RoleNewEditForm from '../role-new-edit-form';
import useFetchOnce from '../../../hooks/useFetchOnce';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function RoleEditView({ id }: Props) {
  const settings = useSettingsContext();
  const { data: roleData } = useFetchOnce<IRole>(`${endpoints.role}/${id}`);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Lista de Funções',
            href: paths.dashboard.role.root,
          },
          { name: roleData?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <RoleNewEditForm currentRole={roleData} />
    </Container>
  );
}

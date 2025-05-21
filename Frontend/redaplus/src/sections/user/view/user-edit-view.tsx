'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IUserItem } from '../../../types/user';
import { endpoints } from '../../../utils/axios';
import UserNewEditForm from '../user-new-edit-form';
import useFetchOnce from '../../../hooks/useFetchOnce';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();

  const { data: currentUser, isLoading, mutate } = useFetchOnce<IUserItem>(endpoints.user.get(id));

  if (isLoading || !currentUser) {
    return <LoadingScreen />;
  }

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
            name: 'Usuário',
            href: paths.dashboard.user.list,
          },
          { name: currentUser.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentUser={currentUser} mutate={mutate} />
    </Container>
  );
}

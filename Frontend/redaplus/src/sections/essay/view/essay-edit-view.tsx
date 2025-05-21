'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IUserItem } from '../../../types/user';
import { endpoints } from '../../../utils/axios';
import useFetchOnce from '../../../hooks/useFetchOnce';
import { LoadingScreen } from '../../../components/loading-screen';
import { IEssayItem } from 'src/types/essay';
import EssayNewEditForm from '../essay-new-edit-form';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function EssayEditView({ id }: Props) {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  const {
    data: currentEssay,
    isLoading,
    mutate,
  } = useFetchOnce<IEssayItem>(endpoints.essay.get(id));

  if (isLoading || !currentEssay) {
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
          { name: currentEssay.title },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EssayNewEditForm user={user} currentEssay={currentEssay} mutate={mutate} />
    </Container>
  );
}

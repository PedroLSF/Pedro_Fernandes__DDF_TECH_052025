'use client';

import { useParams } from 'next/navigation';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import useFetchOnce from 'src/hooks/useFetchOnce';

import { endpoints } from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IChannel } from 'src/types/channel';

import PlaylistNewForm from '../playlist-new-form';

// ----------------------------------------------------------------------

export default function PlaylistCreateView() {
  const settings = useSettingsContext();

  const { id } = useParams();

  const { data: currentChannel, isLoading } = useFetchOnce<IChannel>(
    endpoints.channel.get(id as string)
  );

  if (isLoading || !currentChannel) {
    return <LoadingScreen />;
  }

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
            name: 'Lista de Canal',
            href: paths.dashboard.channel.list,
          },
          {
            name: currentChannel.name ?? 'Canal',
            href: paths.dashboard.channel.profile(currentChannel.id),
          },
          { name: 'Criar Playlist' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlaylistNewForm />
    </Container>
  );
}

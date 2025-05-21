'use client';

import Container from '@mui/material/Container';

import { paths } from '../../../routes/paths';
import { endpoints } from '../../../utils/axios';
import useFetchOnce from '../../../hooks/useFetchOnce';
import { IPlaylistItem } from '../../../types/playlist';
import { PlaylistEditForm } from '../playlist-edit-form';
import { useSettingsContext } from '../../../components/settings';
import { LoadingScreen } from '../../../components/loading-screen';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

type Props = {
  id: string;
};
export default function PlaylistEditView({ id }: Props) {
  const settings = useSettingsContext();

  const { data: currentPlaylist, isLoading } = useFetchOnce<IPlaylistItem>(
    endpoints.playlist.get(id)
  );

  if (isLoading || !currentPlaylist) {
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
            name: 'Lista de Canal',
            href: paths.dashboard.channel.list,
          },
          {
            name: currentPlaylist.channel.name ?? 'Canal',
            href: paths.dashboard.channel.profile(currentPlaylist.channel_id),
          },
          { name: currentPlaylist.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PlaylistEditForm currentPlaylist={currentPlaylist} />
    </Container>
  );
}

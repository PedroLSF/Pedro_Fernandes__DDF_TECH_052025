'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { endpoints } from '../../../utils/axios';
import { IChannel } from '../../../types/channel';
import useFetchOnce from '../../../hooks/useFetchOnce';
import ChannelNewEditForm from '../channel-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function ChannelEditView({ id }: Props) {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();

  const { data: channelData, mutate } = useFetchOnce<IChannel>(`${endpoints.channel.get(id)}`);

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
            name: 'Lista de Canais',
            href: paths.dashboard.channel.list,
          },
          {
            name: `Perfil do canal: ${channelData?.name}`,
            href: paths.dashboard.channel.profile(id),
            ableLastLink: true,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ChannelNewEditForm
        currentChannel={channelData}
        mutate={mutate}
        tab={searchParams.get('tab') ?? 'data'}
      />
    </Container>
  );
}

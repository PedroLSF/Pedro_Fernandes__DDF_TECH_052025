import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import useFetchOnce from 'src/hooks/useFetchOnce';

import { endpoints } from 'src/utils/axios';

import { IChannel } from 'src/types/channel';

// ----------------------------------------------------------------------

type FileIconProps = {
  item: IChannel;
};

export default function ChannelThumbnailTableRow({ item }: FileIconProps) {
  const { data: channelData } = useFetchOnce<IChannel>(`${endpoints.channel.put(item.id)}`);

  const channelUrl = channelData?.thumb?.image_url
    ? channelData?.thumb?.image_url
    : '/assets/images/videos/placeholder-video.png';

  const renderChannel = (
    <Stack
      sx={{
        borderRadius: 1,
        position: 'relative',
        width: '150px',
        paddingBottom: '56.25%',
        backgroundColor: '#ccc',
      }}
    >
      <Box
        component="img"
        src={channelUrl}
        sx={{
          borderRadius: 1,
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Stack>
  );

  return <>{renderChannel}</>;
}

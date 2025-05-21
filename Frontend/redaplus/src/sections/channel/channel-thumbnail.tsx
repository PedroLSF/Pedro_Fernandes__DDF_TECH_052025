import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Theme, SxProps } from '@mui/material/styles';

import { IVideo } from 'src/types/video';
import { IThumb } from 'src/types/channel';

// ----------------------------------------------------------------------

type FileIconProps = {
  sx?: SxProps<Theme>;
  item: IVideo;
  currentThumb: IThumb | undefined;
};

export default function ChannelThumbnail({ sx, item, currentThumb }: FileIconProps) {
  let videoUrl = '/assets/images/videos/placeholder-video.png';
  if (!currentThumb?.image_url && item?.thumb?.image_url) {
    videoUrl = item?.thumb?.image_url;
  }
  if (currentThumb?.image_url) {
    videoUrl = currentThumb?.image_url;
  }

  const renderChannel = (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="start" sx={{ p: 1 }}>
      <Box
        component="img"
        src={videoUrl}
        sx={{
          borderRadius: 1,
          ...sx,
        }}
        data-cy={`video-image-in-channel-${videoUrl}`}
      />
    </Stack>
  );

  return <>{renderChannel}</>;
}

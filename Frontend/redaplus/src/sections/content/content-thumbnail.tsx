import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { Theme, SxProps } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

import { IContentItem } from 'src/types/content';

import { PermissionSlug } from '../../types/role';
import { useAuthContext } from '../../auth/hooks';
import { IVideoFFProbeData } from '../../types/videoContent';
import { fData, fSecondsToHms } from '../../utils/format-number';
import ContentDownloadButton from './content-download-button-component';

// ----------------------------------------------------------------------

type FileIconProps = {
  sx?: SxProps<Theme>;
  item: IContentItem;
  onDownload?: VoidFunction;
  time?: string;
};

export default function ContentThumbnail({ onDownload, sx, item, time }: FileIconProps) {
  const videoUrl = item?.thumb?.image_url
    ? item?.thumb?.image_url
    : '/assets/images/videos/placeholder-video.png';

  const duration =
    time ?? item.original_file_props?.duration ?? item.video_ffprobe_data?.format?.duration;

  const getResolutions = () => {
    const resolutions = item?.video_encode_definition?.resolutions ?? null;
    if (!resolutions) {
      return null;
    }
    const videoStreamLayers = item?.video_ffprobe_data?.streams ?? [];
    let { width, height } = (videoStreamLayers.find((l) => l.codec_type === 'video') ??
      {}) as IVideoFFProbeData['streams'][0];
    if (!width || !height) {
      return null;
    }
    width = Number(width);
    height = Number(height);
    return resolutions.filter((resolution) => {
      const [w, h] = resolution.split('x').map(Number);
      return w <= width && h <= height;
    });
  };

  const { can } = useAuthContext();

  const renderContent = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      sx={{ p: 2 }}
      spacing={3}
      bgcolor="background.neutral"
    >
      <Box
        component="img"
        src={videoUrl}
        sx={{
          objectFit: 'contain',
          borderRadius: 1,
          width: 24,
          height: 24,
          flexShrink: 0,
          ...sx,
        }}
      />
      <Stack direction="column" justifyContent="center" alignItems="flex-start" sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ wordBreak: 'break-word' }}>
          {item.title}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="start"
          sx={{ typography: 'caption', mt: 1 }}
        >
          <Iconify icon="mage:video-player-fill" sx={{ color: 'info.main' }} mr={0.4} />
          {item?.original_file_props?.size ? fData(item?.original_file_props?.size) : '-'}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="start"
          sx={{ typography: 'caption' }}
        >
          <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} mr={0.4} />
          {duration ? fSecondsToHms(duration) : '-'}
        </Stack>
      </Stack>

      {onDownload && can(PermissionSlug['download-content']) && (
        <ContentDownloadButton onDownload={onDownload} resolutions={getResolutions()} />
      )}
    </Stack>
  );

  return <>{renderContent}</>;
}

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, Typography } from '@mui/material';
import { Theme, SxProps } from '@mui/material/styles';

import { fData, fSecondsToHms } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';

import { IArchive } from 'src/types/archive';
import { PermissionSlug } from 'src/types/role';

import { IContentItem } from '../../types/content';
import { fileData, fileThumb, fileFormat } from '../../components/file-thumbnail';

// ----------------------------------------------------------------------

type FileIconProps = {
  sx?: SxProps<Theme>;
  item: IContentItem | IArchive;
  onDownload?: VoidFunction;
  time?: string;
};

export default function RawContentThumbnail({ onDownload, sx, item, time }: FileIconProps) {
  const { path = '', preview = '', type = '' } = fileData(item.original_file_props as any);
  const format = fileFormat(path || preview || type);
  let duration = null;

  if ('video_ffprobe_data' in item) {
    duration =
      time ?? item.original_file_props?.duration ?? item.video_ffprobe_data?.format?.duration;
  }

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
        src={fileThumb(format)}
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
          {item?.original_file_props?.size ? fData(item.original_file_props.size) : '-'}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="start"
          sx={{ typography: 'caption' }}
        >
          <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} mr={0.4} />
          {duration && format === 'video' ? fSecondsToHms(duration) : '-'}
        </Stack>
      </Stack>

      {onDownload && can(PermissionSlug['download-raw-videos']) && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#212B36',
            color: 'white',
            ':hover': { backgroundColor: '#354557' },
          }}
          startIcon={<Iconify icon="mingcute:download-3-fill" />}
          onClick={onDownload}
          data-cy="video-download-button"
        >
          Download
        </Button>
      )}
    </Stack>
  );

  return <>{renderContent}</>;
}

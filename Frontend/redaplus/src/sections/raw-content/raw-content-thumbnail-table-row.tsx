import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Theme, SxProps } from '@mui/material/styles';

import { ExtendFile } from 'src/components/file-thumbnail/types';
import { fileData, fileThumb, fileFormat } from 'src/components/file-thumbnail';

// ----------------------------------------------------------------------

type FileIconProps = {
  file: File | string;
  tooltip?: boolean;
  imageView?: boolean;
  sx?: SxProps<Theme>;
  imgSx?: SxProps<Theme>;
};

export default function RawFileThumbnail({ file, tooltip, imageView, sx, imgSx }: FileIconProps) {
  const { name = '', path = '', preview = '', type = '' } = fileData(file as ExtendFile);

  const format = fileFormat(type || path || preview);

  const renderContent =
    format === 'image' && imageView ? (
      <Box
        component="img"
        src={preview}
        sx={{
          width: 1,
          height: 1,
          flexShrink: 0,
          objectFit: 'cover',
          ...imgSx,
        }}
      />
    ) : (
      <Box
        component="img"
        src={fileThumb(format)}
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          ...sx,
        }}
      />
    );

  if (tooltip) {
    return (
      <Tooltip title={name}>
        <Stack
          flexShrink={0}
          component="span"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 'fit-content',
            height: 'inherit',
          }}
        >
          {renderContent}
        </Stack>
      </Tooltip>
    );
  }

  return <>{renderContent}</>;
}

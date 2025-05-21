import { SxProps } from '@mui/system';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles/createTheme';
import CircularProgress from '@mui/material/CircularProgress';

import { fPercent } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  icon: string;
  title: string;
  percent: number | string;
  color?: string;
  sx: SxProps<Theme>;
};

export default function UploadProgressBar({ title, icon, color, percent, sx = {} }: Props) {
  return (
    <Stack
      spacing={2.5}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      sx={{ ...sx, width: 1, minWidth: 200 }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <Iconify icon={icon} width={32} sx={{ color, position: 'absolute' }} />

        <CircularProgress
          variant="determinate"
          value={typeof percent === 'number' ? percent : 0}
          size={56}
          thickness={2}
          sx={{ color, opacity: 0.48 }}
        />

        <CircularProgress
          variant="determinate"
          value={100}
          size={56}
          thickness={3}
          sx={{
            top: 0,
            left: 0,
            opacity: 0.48,
            position: 'absolute',
            color: (theme) => alpha(theme.palette.grey[500], 0.16),
          }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="caption">{fPercent(percent)}</Typography>
      </Stack>
    </Stack>
  );
}

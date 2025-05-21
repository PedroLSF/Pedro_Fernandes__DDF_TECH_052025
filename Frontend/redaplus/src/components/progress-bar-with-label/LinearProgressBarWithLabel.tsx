import * as React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

export default function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; label?: string }
) {
  const { value, label } = props;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {label ?? `${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';

import { fNumber, fPercent } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent?: number;
  icon: React.ReactNode;
}

export default function DashboardWidgetSummary({
  title,
  percent,
  total,
  icon,
  sx,
  ...other
}: Props) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3, ...sx }} {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        {typeof percent === 'number' && (
          <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
            <Iconify
              width={24}
              icon={
                percent < 0
                  ? 'solar:double-alt-arrow-down-bold-duotone'
                  : 'solar:double-alt-arrow-up-bold-duotone'
              }
              sx={{
                mr: 1,
                color: 'success.main',
                ...(percent < 0 && {
                  color: 'error.main',
                }),
              }}
            />

            <Typography component="div" variant="subtitle2">
              {percent > 0 && '+'}

              {fPercent(percent)}
            </Typography>
          </Stack>
        )}

        <Typography variant="h4">{fNumber(total)}</Typography>
      </Box>

      {icon && <Box sx={{ width: 50, height: 50, mb: 1 }}>{icon}</Box>}
    </Card>
  );
}

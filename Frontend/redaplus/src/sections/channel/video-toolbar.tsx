import React from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = {
  // video: any;
  currentStatus: string;
  onChangeStatus: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusOptions: {
    value: string;
    label: string;
  }[];
};

export default function VideoToolbar({
  // video,
  currentStatus,
  statusOptions,
  onChangeStatus,
}: Props) {
  return (
    <TextField
      fullWidth
      select
      label="Disciplina"
      value={currentStatus}
      onChange={onChangeStatus}
      sx={{
        maxWidth: 160,
        marginBottom: 2,
      }}
    >
      {statusOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

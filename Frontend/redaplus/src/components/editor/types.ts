import React from 'react';
import { ReactQuillProps } from 'react-quill';

import { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export interface EditorProps extends ReactQuillProps {
  error?: boolean;
  simple?: boolean;
  helperText?: React.ReactNode;
  sx?: SxProps<Theme>;
}

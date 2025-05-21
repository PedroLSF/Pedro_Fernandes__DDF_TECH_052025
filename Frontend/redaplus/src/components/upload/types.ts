import React from 'react';
import { DropzoneOptions } from 'react-dropzone';

import { Theme, SxProps } from '@mui/material/styles';

import { ExtendFile } from '../file-thumbnail/types';
import { FileWithMetadataId } from '../../types/file';
import { UploadProgress } from '../../types/progress';
import { ContentWithMetadataId } from '../../types/content';

// ----------------------------------------------------------------------

export interface CustomFile extends File, ContentWithMetadataId {
  path?: string;
  preview?: string;
  lastModifiedDate?: Date;
}

export interface UploadProps extends DropzoneOptions {
  error?: boolean;
  sx?: SxProps<Theme>;
  thumbnail?: boolean;
  placeholder?: React.ReactNode;
  helperText?: React.ReactNode;
  disableMultiple?: boolean;
  //
  file?: CustomFile | string | null;
  onDelete?: VoidFunction;
  //
  files?: (File | CustomFile | ExtendFile | string)[];
  onUpload?: VoidFunction;
  onRemove?: (file: XOR<XOR<CustomFile, FileWithMetadataId>, string>) => void;
  onRemoveAll?: VoidFunction;
  uploadProgress?: UploadProgress;
  abortedFiles?: Record<string, boolean>;
  hideEncodeProgress?: boolean;
}

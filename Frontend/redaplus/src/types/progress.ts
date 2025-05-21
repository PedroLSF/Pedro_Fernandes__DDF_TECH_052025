export enum UploadProgressStatus {
  'pending' = 'pending',
  'ok' = 'ok',
  'error' = 'error',
}
export type UploadProgressRecord = { status: UploadProgressStatus; progress: number };

export type UploadProgress = {
  [key in UploadProgressContexts]: Record<string, UploadProgressRecord>;
};

export enum UploadProgressContexts {
  'upload' = 'upload',
  'encode' = 'encode',
  'encode_download' = 'encode_download',
  'encode_upload' = 'encode_upload',
}

export const trackUploadProgress = [
  UploadProgressContexts.encode_download,
  UploadProgressContexts.encode,
  UploadProgressContexts.encode_upload,
];

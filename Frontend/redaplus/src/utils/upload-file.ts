import { AxiosProgressEvent } from 'axios';
import { ReadonlyURLSearchParams } from 'next/navigation';

import axios, { endpoints } from './axios';
import { FileWithMetadataId } from '../types/file';

export function fileArchiveListener(options: {
  searchParams: ReadonlyURLSearchParams;
  params: {
    category_id?: string | string[] | null;
  };
  onSuccess: (file: FileWithMetadataId) => void;
  onError: (error: any, file?: FileWithMetadataId) => void;
}) {
  return async function listener(
    file: FileWithMetadataId,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    onUploadError: () => void,
    abortController: AbortController
  ) {
    try {
      const requestUploadPayload: Record<string, any> = {
        title: file.name,
        frontend_file_id: file.id,
        file_path:
          (file as FileWithMetadataId & { path: string }).path ??
          (file as any).webkitRelativePath ??
          (file as any).mozFullPath,
        file_name: file.name,
        file_size: file.size,
        file_last_modified: file.lastModified,
        file_type: file.type === '' ? file.name.split('.').pop() : file.type,
      };
      let url = endpoints.upload.requestFileUpload;

      const {
        data: { file_id, upload_uri },
      } = await axios.post(url, requestUploadPayload);
      if (!upload_uri) {
        throw new Error('Upload uri is missing');
      }

      const response = await axios.put(upload_uri, file, {
        onUploadProgress,
        signal: abortController.signal,
        headers: {
          Authorization: undefined,
          'Content-Type': file.type,
        },
      });

      if (response.status === 200) {
        url = endpoints.upload.fileUploaded;
        const payload = {
          file_id,
          frontend_file_id: file.id,
          category_id: options.params.category_id,
        } as Record<string, string | string[]>;

        await axios.post(url, payload);
      }
      options.onSuccess(file);
      return { response, file_id };
    } catch (error) {
      console.error(error);
      onUploadError();
      options.onError(error, file);
    }
    return null;
  };
}

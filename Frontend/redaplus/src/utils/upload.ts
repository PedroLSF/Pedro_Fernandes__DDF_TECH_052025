import { AxiosProgressEvent } from 'axios';
import { ReadonlyURLSearchParams } from 'next/navigation';

import { ICategory } from 'src/types/category';

import axios, { endpoints } from './axios';
import { PRIORITY_HIGH } from './generics';
import { FileWithMetadataId } from '../types/file';
import { getVideoDuration, getVideoResolution } from './video';

export function fileListener(options: {
  searchParams: ReadonlyURLSearchParams;
  params: {
    directories_created?: Array<ICategory> | null;
    category_id?: string | string[] | null;
    channel_id?: string[];
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
      const human_type = options.searchParams.get('human_type') ?? 'raw';

      if (human_type !== 'raw') {
        const resolution = await getVideoResolution(file);
        if (!resolution || resolution.height < 480) {
          throw new Error('O vídeo precisa ter resolução mínima de 480p.');
        }
      }

      const replace_id = options.searchParams.get('replace_id') ?? null;
      let requestUploadPayload: Record<string, any> = {
        title: file.name,
        file_id: file.id,
        file_path:
          (file as FileWithMetadataId & { path: string }).path ??
          (file as any).webkitRelativePath ??
          (file as any).mozFullPath,
        file_name: file.name,
        file_size: file.size,
        file_last_modified: file.lastModified,
        file_type: file.type,
        human_type,
        duration: await getVideoDuration(file),
      };
      let url = '';
      if (replace_id) {
        url = '';
        requestUploadPayload = {
          file_type: file.type,
          video_id: replace_id,
          duration: await getVideoDuration(file),
          file_size: file.size,
        } as Record<string, any>;
      }
      const {
        data: { video_id, upload_uri },
      } = await axios.post(url, requestUploadPayload);
      if (!upload_uri) {
        throw new Error('Upload uri is missing');
      }

      const response = await axios.put(upload_uri, file, {
        onUploadProgress,
        signal: abortController.signal,
        headers: {
          Authorization: undefined,
          'Content-Type': file.type ?? 'video/mp4',
        },
      });

      if (response.status === 200) {
        url = '';
        let payload = {
          video_id,
          file_id: file.id,
          category_id: options.params.category_id,
          channel_id: options.params.channel_id,
          video_priority: PRIORITY_HIGH,
          generate_progress: true,
        } as Record<string, string | string[] | number | boolean>;
        if (replace_id) {
          url = '';
          payload = {
            video_id,
            video_priority: PRIORITY_HIGH,
            generate_progress: true,
          };
        }
        await axios.post(url, payload);
      }
      options.onSuccess(file);
      return { response, video_id, human_type };
    } catch (error) {
      console.error(error);
      onUploadError();
      options.onError(error, file);
    }
    return null;
  };
}

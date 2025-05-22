import { useRef, useMemo, useState } from 'react';
import { AxiosResponse, AxiosProgressEvent } from 'axios';

import { ContentWithMetadataId, UploadQueueController } from 'src/types/content';

import axios from '../utils/axios';
import { video_types } from '../types/video';
import {
  UploadProgress,
  trackUploadProgress,
  UploadProgressStatus,
  UploadProgressContexts,
} from '../types/progress';

export type UseUploadControllerProps = {
  allowedPathname?: string;
  fileListener?: (
    file: ContentWithMetadataId,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    onUploadError: () => void,
    abortController: AbortController
  ) => Promise<{ response: AxiosResponse<any, any>; human_type: string; video_id: string } | null>;
  fileArchiveListener?: (
    file: ContentWithMetadataId,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    onUploadError: () => void,
    abortController: AbortController
  ) => Promise<{ response: AxiosResponse<any, any>; file_id: string } | null>;
};

export default function useUploadController(props: UseUploadControllerProps) {
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line
  const [_, setListenersIntervalIds] = useState<NodeJS.Timeout[]>([]);
  const [filesWithId, setFilesWithId] = useState<ContentWithMetadataId[]>([]);
  const [abortedFiles, setAbortedFiles] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    upload: {},
    encode_download: {},
    encode: {},
    encode_upload: {},
  });
  const uploadQueueController: UploadQueueController = useMemo<UploadQueueController>(
    () => ({
      concurrency: 2,
      currentUploadingIds: [],
      queueIds: [],
      uploadListeners: {},
      uploadAbortControllers: {},
      progressListeners: {},
      progressInterval: 1735,
    }),
    []
  );

  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  const startSilentAudio = () => {
    if (!silentAudioRef.current) {
      silentAudioRef.current = new Audio();
      const audio =
        'data:audio/wav;base64,UklGRuQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAACABAAZGF0YQAAAAAA//8AAAAAZn5+fn4AAAAAAAB+fn5+AAAAAAAAfn5+fn4AAAAAfn5+fn5+fn4AAAAAfn5+fn5+fn5+fn4AAAAAfn5+fn5+fn5+fn5+fn4AAAAAfn5+fn5+fn5+fn5+fn4AAAAAfn5+fn5+fn5+fn5+fn4AAAAAfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5';
      silentAudioRef.current.src = audio;
      silentAudioRef.current.volume = 0.001;
      silentAudioRef.current.loop = true;
      silentAudioRef.current.play().catch((e) => console.warn('Audio autoplay failed:', e));
    }
  };

  const stopSilentAudio = () => {
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current = null;
    }
  };

  const promoteNewUploads = () => {
    if (uploadQueueController.currentUploadingIds.length < uploadQueueController.concurrency) {
      const toUpload = Math.max(
        uploadQueueController.concurrency - uploadQueueController.currentUploadingIds.length,
        0
      );
      const idsToUpload: string[] = [];
      for (let i = 0; i < toUpload; i += 1) {
        if (uploadQueueController.queueIds.length) {
          const queuedId = uploadQueueController.queueIds.shift();
          if (queuedId) {
            idsToUpload.push(queuedId);
          }
        }
      }
      uploadQueueController.currentUploadingIds.push(...idsToUpload);
    }
  };

  const stopUploadWhenQueueIsEmpty = () => {
    if (
      uploadQueueController.currentUploadingIds.length === 0 &&
      uploadQueueController.queueIds.length === 0
    ) {
      setIsUploading(false);
      stopSilentAudio();
      return;
    }

    setIsUploading(uploadQueueController.currentUploadingIds.length > 0);
  };

  const makeProgressListener = (video_id: string, context: UploadProgressContexts): Promise<void> =>
    new Promise((res, rej) => {
      let intervalId: NodeJS.Timeout | null = null;
      const resolve = () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        res();
      };
      const reject = (error: any) => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        rej(error);
      };
      try {
        intervalId = setInterval(async () => {
          if (props.allowedPathname !== window.location.pathname) {
            resolve();
          }
          const { data: progressData } = await axios.get('', {
            params: {
              context,
              resource_id: video_id,
              resource_type: 'video',
            },
          });
          if (!progressData) {
            return;
          }
          const currentProgress = progressData?.progress ?? 0;
          const currentStatus =
            currentProgress === 100 ? UploadProgressStatus.ok : UploadProgressStatus.pending;
          setUploadProgress((old: UploadProgress) => {
            if (
              currentStatus === UploadProgressStatus.ok ||
              old?.[context]?.[video_id]?.status === UploadProgressStatus.error
            ) {
              resolve();
            }
            return {
              ...old,
              [context]: {
                ...old[context],
                [video_id]: {
                  progress: currentProgress,
                  status: currentStatus,
                },
              },
            };
          });
          if (currentStatus === UploadProgressStatus.ok) {
            resolve();
          }
        }, uploadQueueController.progressInterval);
        setListenersIntervalIds((old) => {
          if (intervalId) {
            old.push(intervalId);
          }
          return old;
        });
      } catch (error) {
        reject(error);
      }
    });

  const uploadControllerLoop = () => {
    promoteNewUploads();
    uploadQueueController.currentUploadingIds.forEach((id) => {
      if (id in uploadQueueController.uploadListeners) {
        return;
      }
      const file = filesWithId.find((f) => f.id === id);
      if (!file) {
        return;
      }
      uploadQueueController.uploadAbortControllers[id] = new AbortController();
      uploadQueueController.uploadListeners[id] = (async () => {
        try {
          const extension = file.name.split('.').pop();
          if (video_types.includes(`.${extension}`)) {
            const data = await props?.fileListener?.(
              file,
              (progressEvent: AxiosProgressEvent) => {
                setUploadProgress((old) => {
                  if (!progressEvent?.loaded || !progressEvent.total) {
                    return old;
                  }
                  const p = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  return {
                    ...old,
                    upload: {
                      ...old.upload,
                      [id]: {
                        progress: p,
                        status: p === 100 ? UploadProgressStatus.ok : UploadProgressStatus.pending,
                      },
                    },
                  };
                });
              },
              () => {
                setUploadProgress((old) => ({
                  ...old,
                  upload: {
                    ...old.upload,
                    [id]: {
                      ...old.upload[id],
                      status: UploadProgressStatus.error,
                    },
                  },
                }));
              },
              uploadQueueController.uploadAbortControllers[id]
            );
            uploadQueueController.currentUploadingIds.splice(
              uploadQueueController.currentUploadingIds.indexOf(id),
              1
            );
            const { response, video_id, human_type } = data ?? {};
            file.video_id = video_id;
            if (!video_id || human_type !== 'edited') {
              return response ?? null;
            }

            if (video_id in uploadQueueController.progressListeners) {
              return response ?? null;
            }

            for (const context of trackUploadProgress) {
              if (!uploadQueueController.progressListeners[video_id]) {
                uploadQueueController.progressListeners[video_id] = {} as any;
              }
              uploadQueueController.progressListeners[video_id][context] = makeProgressListener(
                video_id,
                context
              );
            }

            return response ?? null;
          }

          const data = await props?.fileArchiveListener?.(
            file,
            (progressEvent: AxiosProgressEvent) => {
              setUploadProgress((old) => {
                if (!progressEvent?.loaded || !progressEvent.total) {
                  return old;
                }
                const p = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                return {
                  ...old,
                  upload: {
                    ...old.upload,
                    [id]: {
                      progress: p,
                      status: p === 100 ? UploadProgressStatus.ok : UploadProgressStatus.pending,
                    },
                  },
                };
              });
            },
            () => {
              setUploadProgress((old) => ({
                ...old,
                upload: {
                  ...old.upload,
                  [id]: {
                    ...old.upload[id],
                    status: UploadProgressStatus.error,
                  },
                },
              }));
            },
            uploadQueueController.uploadAbortControllers[id]
          );
          uploadQueueController.currentUploadingIds.splice(
            uploadQueueController.currentUploadingIds.indexOf(id),
            1
          );

          const { response, file_id } = data ?? {};
          file.file_id = file_id;
          if (!file_id) {
            return response ?? null;
          }

          return response ?? null;
        } catch (error) {
          console.error(error);
        } finally {
          uploadControllerLoop();
        }
        return null;
      })() as Promise<AxiosResponse>;
    });
    stopUploadWhenQueueIsEmpty();
  };

  const removeFileWithIdFromUploadQueue = (fileId: string) => {
    const currentUploadingIndex = uploadQueueController.currentUploadingIds.indexOf(fileId);
    if (currentUploadingIndex !== -1) {
      uploadQueueController.currentUploadingIds.splice(currentUploadingIndex, 1);
    }
    const queueIdIndex = uploadQueueController.queueIds.indexOf(fileId);
    if (queueIdIndex !== -1) {
      uploadQueueController.queueIds.splice(queueIdIndex, 1);
    }
  };

  const removeFileWithId = (fileId: string) => {
    setFilesWithId((old) => old.filter(({ id }) => id !== fileId));
    if (fileId in uploadQueueController.uploadAbortControllers) {
      uploadQueueController.uploadAbortControllers[fileId].abort();
    }
    removeFileWithIdFromUploadQueue(fileId);
    delete uploadQueueController.uploadListeners[fileId];
    delete uploadQueueController.uploadAbortControllers[fileId];
    delete uploadProgress.upload[fileId];
    delete abortedFiles[fileId];
    uploadControllerLoop();
  };

  const handleStartUploadQueue = () => {
    setIsUploading(true);
    startSilentAudio();
    uploadQueueController.queueIds = (
      filesWithId.filter(({ id }) => id) as Array<{ id: string }>
    ).map(({ id }) => id);
    uploadControllerLoop();
  };

  const abortUploadForFile = (fileId: string) => {
    uploadQueueController.uploadAbortControllers?.[fileId]?.abort?.();
    setAbortedFiles((old) => ({ ...old, [fileId]: true }));
    removeFileWithIdFromUploadQueue(fileId);
    uploadControllerLoop();
  };

  const reset = () => {
    stopSilentAudio();
    filesWithId.forEach((file) => {
      removeFileWithId(file.id);
    });
    setFilesWithId([]);
    uploadQueueController.currentUploadingIds = [];
    uploadQueueController.queueIds = [];
    setIsUploading(false);
  };

  return {
    isUploading,
    handleStartUploadQueue,
    setFilesWithId,
    uploadProgress,
    uploadControllerLoop,
    filesWithId,
    abortUploadForFile,
    abortedFiles,
    removeFileWithId,
    reset,
  };
}

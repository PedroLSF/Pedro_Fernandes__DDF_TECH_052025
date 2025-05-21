import { delay } from './promise';
import { video_types } from '../types/video';
import axiosInstance, { endpoints } from './axios';

export async function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(null);
    };
    video.src = URL.createObjectURL(file);
  });
}

export async function downloadVideo(props: {
  video_id: string;
  onError: (message: string) => void;
}) {
  try {
    const {
      data: { url },
    } = await axiosInstance.post(endpoints.video.requestDownload(props.video_id));
    if (url) {
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error(error);
    const message = error.message ?? 'Erro ao requisitar download';
    props.onError(message);
  }
}

export async function downloadFile(props: { id: string; onError: (message: string) => void }) {
  try {
    const {
      data: { url },
    } = await axiosInstance.post(endpoints.file.requestDownload(props.id));
    if (url) {
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error(error);
    const message = error.message ?? 'Erro ao requisitar download';
    props.onError(message);
  }
}

export async function downloadVideos(props: {
  video_ids: string[];
  onError: (message: string) => void;
  onSuccess: (url: string) => void;
}) {
  try {
    const {
      data: { token },
    } = await axiosInstance.post(endpoints.video.requestCompressedVideosDownload, {
      ids: props.video_ids,
    });
    const getUrl = async () => {
      const {
        data: { url },
      } = await axiosInstance.get(endpoints.video.receiveVideoDownloadUrl(token));
      if (!url) {
        await delay(2.5 * 1000);
        void getUrl();
        return;
      }
      props.onSuccess(url);
    };
    void getUrl();
  } catch (error) {
    console.error(error);
    const message = error.message ?? 'Erro ao requisitar download';
    props.onError(message);
  }
}

export async function downloadVideoResolution(props: {
  video_id: string;
  resolution: string;
  onError: (message: string) => void;
  onSuccess: (url: string) => void;
}) {
  try {
    const {
      data: { token },
    } = await axiosInstance.post(endpoints.video.requestVideoResolutionDownload, {
      video_id: props.video_id,
      resolution: props.resolution,
    });
    const getUrl = async () => {
      const {
        data: { url },
      } = await axiosInstance.get(endpoints.video.receiveVideoDownloadUrl(token));
      if (!url) {
        await delay(2.5 * 1000);
        void getUrl();
        return;
      }
      props.onSuccess(url);
    };
    void getUrl();
  } catch (error) {
    console.error(error);
    const message = error.message ?? 'Erro ao requisitar download';
    props.onError(message);
  }
}

export async function downloadVideoTrack(props: {
  video_track_id: string;
  onError: (message: string) => void;
}) {
  try {
    const {
      data: { url },
    } = await axiosInstance.post(endpoints.videoTrack.requestDownload(props.video_track_id));
    if (url) {
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error(error);
    const message = error.message ?? 'Erro ao requisitar download';
    props.onError(message);
  }
}

export function removeExtension(filename: string | undefined): string {
  if (!filename) return '';

  const lastDotIndex = filename.lastIndexOf('.');

  if (lastDotIndex === -1) return filename;

  const extension = filename.slice(lastDotIndex);

  if (video_types.includes(extension.toLowerCase())) {
    return filename.slice(0, lastDotIndex);
  }

  return filename;
}

export async function getVideoResolution(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      resolve(null);
    };
    video.src = URL.createObjectURL(file);
  });
}

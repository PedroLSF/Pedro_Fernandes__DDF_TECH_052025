import { IThumb } from './channel';
import { ICategory } from './category';
import { IVideoFFProbeData, IFileOriginalProps, IVideoEncodeDefinition } from './videoContent';

export enum VideoHumanType {
  raw = 'raw',
  edited = 'edited',
}

export type IVideoChannel = {
  id: string;
  channel_id: string;
  video_id: string;
  created_at: Date;
  video: IVideo;
  updated_at?: Date;
};

export type PaginatedIVideoPlaylist = {
  results: IVideoPlaylist[];
  total: number;
  take: number;
  skip: number;
  totalPages: number;
  currentPage: number;
};

export type IVideoPlaylist = {
  id: string;
  order: number;
  playlist_id: string;
  video_id: string;
  video: IVideo;
  playlist: any;

  created_at: Date;
  updated_at?: Date;
};

export interface IVideo {
  id: string;
  title: string;

  human_type: VideoHumanType;
  status: VideoStatus;
  original_file_props: IFileOriginalProps | null;
  video_ffprobe_data: IVideoFFProbeData | null;
  video_encode_definition: IVideoEncodeDefinition | null;
  videoChannels: IVideoChannel[];
  videoPlaylist: IVideoPlaylist[];

  storage_key: string | null;
  active: boolean;

  category_id: string;
  category: ICategory;

  created_at?: Date;
  updated_at?: Date | null;
  uploaded_at?: Date | null;

  tags: object[];
  thumb: IThumb;
}

export type IVideoFilterValue = string;

export type IVideoFilters = {
  name: string | undefined;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
  channel_id?: string | undefined | any;
  human_type?: VideoHumanType;
  not_in_channel_id?: boolean | string | undefined | any;
  self_created_only?: boolean | null | string;
  video_from_channel?: boolean | null | string;
  only_files?: boolean | null | string;
  only_videos?: boolean | null | string;
};

export const video_types = [
  '.mov',
  '.mp4',
  '.webm',
  '.mkv',
  '.avi',
  '.wmv',
  '.flv',
  '.mpeg',
  '.mpg',
  '.m4v',
  '.3gp',
  '.m2ts',
  '.ts',
  '.vob',
  '.ogv',
  '.ogg',
];

export enum VideoStatus {
  none = 'none',
  raw_uploaded = 'raw_uploaded',
  waiting_encode = 'waiting_encode',
  encoded = 'encoded',
  error = 'error',
}

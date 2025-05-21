import { AxiosResponse } from 'axios';

import { ITagItem } from './tag';
import { IThumb } from './channel';
import { ICategory } from './category';
import { UploadProgressContexts } from './progress';
import { IVideoChannel, IVideoPlaylist } from './video';
import {
  ISambaData,
  VideoHumanType,
  IVideoFFProbeData,
  IFileOriginalProps,
  IVideoEncodeDefinition,
} from './videoContent';

export enum VideoStatus {
  none = 'none',
  raw_uploaded = 'raw_uploaded',
  waiting_encode = 'waiting_encode',
  encoded = 'encoded',
  error = 'error',
}

export enum VideoTrackKind {
  subtitles = 'Legenda',
  captions = 'Legenda detalhada',
  descriptions = 'Descrição',
  chapters = 'Capítulos',
  metadata = 'Metadados',
}

export enum VideoTrackLang {
  pt_br = 'Português brasileiro',
  en = 'Inglês',
  es = 'Espanhol',
}

export type ContentEmbeds = {
  embed_url: string;
  title: string;
};

export const stateIconsSubtitle = {
  none: 'mdi:clock-outline',
  on_queue_subtitle: 'mdi:timer-sand',
  waiting_subtitle: 'mdi:timer-sand',
  subtitle_generated: 'mdi:check-circle-outline',
};

export const contentStatusTranslationSubtitle = {
  none: 'Sem geração',
  on_queue_subtitle: 'Aguardando legenda (IA)',
  waiting_subtitle: 'Gerando Legenda (IA)',
  subtitle_generated: 'Legenda Gerada (IA)',
};

export enum VideoTrackStatus {
  none = 'none',
  on_queue_subtitle = 'on_queue_subtitle',
  waiting_subtitle = 'waiting_subtitle',
  subtitle_generated = 'subtitle_generated',
}

export type IUserItem = {
  id: string;
  name: string;
};

export interface IVideoTrack {
  id: string;
  video_id: string;
  kind: VideoTrackKind;
  original_file_props: AnyObject | null;
  label: string;
  lang: string;
  is_default: boolean;
  storage_key: string | null;
  created_at: Date;
  approved_by: string | null;
  approvedByUser?: IUserItem | null;
  status: VideoTrackStatus;
  auto_generated: boolean;
  updated_at: Date | null;
  uploaded_at: Date | null;
}

export type IContentItem = {
  id: string;
  title: string;
  human_type: VideoHumanType;
  original_file_props?: IFileOriginalProps;
  samba_file_props?: ISambaData;
  video_ffprobe_data?: IVideoFFProbeData;
  video_encode_definition?: IVideoEncodeDefinition;
  storage_key?: string;
  status: VideoStatus;
  active: boolean;
  description?: string;
  category_id?: string | null;
  createdAt: Date | number | string;
  created_at: Date | number | string;
  updated_at?: Date | number | string;
  uploaded_at?: Date | number | string;
  deleted_at?: Date | number | string;
  embeds: ContentEmbeds[];
  view_count?: number;
  created_by?: string;

  thumb?: IThumb;
  category?: ICategory;
  tags: IVideoTags[];
  tracks?: IVideoTrack[];
  videoChannels?: IVideoChannel[];
  videoPlaylist?: IVideoPlaylist[];
};

export type IVideoTags = {
  tag_id: string;
  video_id: string;

  created_at: Date | number | string;
  updated_at?: Date | number | string;
  video: IContentItem;
  tag: ITagItem;
};

export interface IContentTableFilters {
  id?: string;
  active: string;
  name: string;
  end_date: Date | null;
  start_date: Date | null;
  category_id: string | null;
  self_created_only: boolean;
  dont_include_category_child: boolean;
  resource_id: string;
}

export interface IContentViewFilters extends IContentTableFilters {
  waiting_encode: string;
  error: string;
  waiting_approve: string;
}

export type IContentHistoricTableFilters = {
  created_at_from: Date | string | null;
  created_at_to: Date | string | null;
  resource_id: string;
};

// ----------------------------------------------------------------------

export type IContentShared = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  permission: string;
};

export type ContentWithMetadataId = File & {
  id: string;
  metadata?: Record<string, any>;
  path?: string;
  preview?: string | null;
  currentProgressContext?: string;
  video_id?: string;
  file_id?: string;
};

export type UploadQueueController = {
  concurrency: number;
  currentUploadingIds: string[];
  queueIds: string[];
  uploadListeners: Record<string, Promise<AxiosResponse | null>>;
  uploadAbortControllers: Record<string, AbortController>;
  progressListeners: Record<string, Record<UploadProgressContexts, Promise<void>>>;
  progressInterval: number;
};

export const CONTENT_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'Active' },
  { value: 'false', label: 'Inativo', dataCy: 'Inactive' },
];

export enum ContentTabsValues {
  'true' = 'true',
  'false' = 'false',
  'waiting_encode' = 'waiting_encode',
  'error' = 'error',
  'waiting_subtitle' = 'waiting_subtitle',
  'waiting_approve' = 'waiting_approve',
}

export const CONTENT_SHARE_EXPIRATION_TIME_OPTIONS = [
  { value: '6', label: '6 Horas', dataCy: '6-hours' },
  { value: '12', label: '12 Horas', dataCy: '12-hours' },
  { value: '18', label: '18 Horas', dataCy: '18-hours' },
  { value: '24', label: '1 dia', dataCy: '24-hours' },
  { value: '48', label: '2 dias', dataCy: '48-hours' },
  { value: '72', label: '3 dias', dataCy: '72-hours' },
  { value: '96', label: '4 dias', dataCy: '96-hours' },
  { value: '120', label: '5 dias', dataCy: '120-hours' },
  { value: '144', label: '6 dias', dataCy: '144-hours' },
  { value: '168', label: '7 dias', dataCy: '168-hours' },
];

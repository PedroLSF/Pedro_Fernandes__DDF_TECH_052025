import { ITagItem } from './tag';
import { IVideoPlaylist } from './video';
import { IThumb, IChannel } from './channel';

export type IPlaylistTableFilters = {
  name: string;
  tags_ids?: string;
  category_id?: string | undefined | any;
  active: boolean | string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  channel_id?: string | null;
};

export const PLAYLIST_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'ativo-status' },
  { value: 'false', label: 'Inativo', dataCy: 'inativo-status' },
];

export type PlaylistEmbed = {
  title: string;
  embed_url: string;
};

export type IPlaylistItem = {
  id: string;
  name: string;
  channel_id: string;
  active: boolean;
  tag_ids: string[];
  video_ids: string[];
  embed?: PlaylistEmbed;

  created_at: Date;
  updated_at?: Date;

  channel: IChannel;
  videoPlaylist: IVideoPlaylist[];
  tagPlaylist: ITagPlaylist[];

  _count: {
    videoPlaylist: number;
  };

  thumb: IThumb;
};

export type IPlaylist = {
  results: IPlaylistItem[];
  total: number;
  take: number;
  skip: number;
  totalPages: number;
  currentPage: number;
};

export type ITagPlaylist = {
  id: string;
  playlist_id: string;
  tag_id: string;
  tag: ITagItem;
  playlist: IPlaylist;

  created_at: Date;
  updated_at?: Date;
};

export const PLAYLIST_TABS = [
  { value: 'add_videos', label: 'Adicionar vídeos', dataCy: 'playlist-add-videos' },
  { value: 'order_videos', label: 'Ordenar vídeos', dataCy: 'playlist-order-videos' },
];

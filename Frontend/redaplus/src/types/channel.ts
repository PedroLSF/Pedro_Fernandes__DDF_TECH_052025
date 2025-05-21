import { ITagItem } from './tag';
import { IDomainItem } from './domain';
import { ICategory } from './category';

export type IChannelTableFilterValue = string | string[] | Date | null;

export type IChannelTableFilters = {
  name: string | undefined;
  active: boolean | undefined | any;
  type: string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
};

export enum LogoPosition {
  TopRight = 'TopRight',
  TopLeft = 'TopLeft',
  TopMiddle = 'TopMiddle',
  BottomRight = 'BottomRight',
  BottomLeft = 'BottomLeft',
  BottomMiddle = 'BottomMiddle',
}

export enum Color {
  Gray = 'themeGray',
  Green = 'themeGreen',
  Blue = 'themeBlue',
  Yellow = 'themeYellow',
  Orange = 'themeOrange',
  Red = 'themeRed',
}

export type IThumb = {
  id: string;
  channel_id?: string;
  video_id?: string;

  image_url: string;
  storage_key: string;

  created_at: string;
  updated_at: string;
};

export type ILogo = {
  id: string;
  channel_id: string;

  image_url: string;
  storage_key: string;

  position: LogoPosition;
  channel?: IChannel[];

  created_at: string;
  updated_at: string;
};

export type IChannel = {
  _count?: {
    videoChannels: number;
    playlist: number;
  };
  id: string;
  name: string;
  description?: string | undefined;
  storage_key?: string | null;
  type: string;
  active: boolean;
  tag_ids: string[];
  video_ids: string[];
  domain_names: string[];

  logo: ILogo;
  logo_id?: string;

  intro_id: string;
  intro: {
    id: string;
    title: string;

    category_id: string;
    category: ICategory;

    created_at?: Date;
    updated_at?: Date | null;

    thumb: IThumb;
  };

  ending_id: string;
  ending: {
    id: string;
    title: string;

    category_id: string;
    category: ICategory;

    created_at?: Date;
    updated_at?: Date | null;

    thumb: IThumb;
  };

  tagChannels: ITagChannel[];
  domainChannels: IDomainChannel[];
  thumb: IThumb;
  color: Color | string;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ITagChannel = {
  id: string;
  channel_id: string;
  tag_id: string;
  tag: ITagItem;
  created_at: Date;
  updated_at?: Date;
};

export type IDomainChannel = {
  id: string;
  channel_id: string;
  domain_id: string;
  domain: IDomainItem;
  created_at: Date;
  updated_at?: Date;
};

export const CHANNEL_TYPE_OPTIONS = [
  { value: 'private', label: 'Privado', dataCy: 'quick-edit-privado' },
  { value: 'public', label: 'Publico', dataCy: 'quick-edit-publico' },
];

export const CHANNEL_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'quick-edit-ativo' },
  { value: 'false', label: 'Inativo', dataCy: 'quick-edit-inativo' },
];

export function getChannelLabel(type: string | undefined) {
  const option = CHANNEL_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option ? option.label : undefined;
}

export const LOGO_POSITION_TYPES = [
  { value: 'TopRight', label: 'Superior Direito', dataCy: 'top-right' },
  { value: 'TopLeft', label: 'Superior Esquerdo', dataCy: 'top-left' },
  { value: 'TopMiddle', label: 'Centro Superior', dataCy: 'top-middle' },

  { value: 'BottomRight', label: 'Inferior Direito', dataCy: 'Bottom-right' },
  { value: 'BottomLeft', label: 'Inferior Esquerdo', dataCy: 'Bottom-left' },
  { value: 'BottomMiddle', label: 'Centro Inferior', dataCy: 'Bottom-middle' },
];

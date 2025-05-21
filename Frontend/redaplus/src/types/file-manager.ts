import { IVideo } from './video';
import { IArchive } from './archive';

export type IFolderManager = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  totalFiles?: number;
  totalFolders?: number;
  totalArchives?: number;
  createdAt: Date | number | string | null;
  modifiedAt: Date | number | string | null;
  video?: IVideo;
  file?: IArchive;
  path: Array<{ id: string; name: string }>;
  parent_id?: string | null | false;
};

export type IVideoManager = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: Date | number | string | null;
  modifiedAt: Date | number | string | null;
  video?: IVideo;
  file?: IArchive;
  path: Array<{ id: string; name: string }>;
};

export type IFileManager = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: Date | number | string | null;
  modifiedAt: Date | number | string | null;
  video?: IVideo;
  path: Array<{ id: string; name: string }>;
  file?: IArchive;
};

export type IFile = IVideoManager | IFolderManager | IFileManager;

import { IUserItem } from './user';
import { ICategory } from './category';

export type IArchiveFilters = {
  name: string | undefined;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
  self_created_only?: boolean | null | string;
  only_files?: boolean | null | string;
  only_videos?: boolean | null | string;
};

export type IArchive = {
  id: string;
  title: string;

  original_file_props: AnyObject | null;

  storage_key: string | null;
  active: boolean;

  category_id: string;
  category: ICategory;

  created_by?: string | null;
  createdByUser?: IUserItem | null;

  created_at?: Date;
  updated_at?: Date | null;
  uploaded_at?: Date | null;
};

export const archive_types = [
  'text/plain', // .txt
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/pdf', // .pdf
  'image/jpeg', // .jpg
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/x-premiere-project', // .prproj
];

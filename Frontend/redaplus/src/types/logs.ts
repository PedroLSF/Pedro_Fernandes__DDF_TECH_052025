import { IUserItem } from './user';

export type ILogsTableFilterValue = string | string[] | Date | null;

export const actionTranslation = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  sign_in: 'Entrar',
  change_password: 'Alterar senha',
  retrieve_password: 'Recuperar senha',
  confirm_retrieve_password: 'Confirmar recuperação de senha',
  upload: 'Upload',
  preview: 'Prévia de vídeo',
};

export const resource_type = {
  user: 'Usuário',
};

export type ILogsTableFilters = {
  name: string | undefined | any;
  action: string | undefined | any;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
};

export type ILogs = {
  id: string;
  user_id: string;

  action: ActivityLogAction;
  description: string;

  resource_id: string;
  resource_type: ActivityLogResourceType;

  input?: AnyObject;
  output?: AnyObject;

  created_at: Date | null;

  user?: IUserItem;
};

export enum ActivityLogResourceType {
  user = 'user',
  api_token = 'api_token',
  tag = 'tag',
  video = 'video',
  thumb = 'thumb',
  project = 'project',
  video_part = 'video_part',
  metric = 'metric',
}

export enum ActivityLogAction {
  sign_in = 'sign_in',
  create = 'create',
  update = 'update',
  delete = 'delete',
  change_password = 'change_password',
  retrieve_password = 'retrieve_password',
  confirm_retrieve_password = 'confirm_retrieve_password',
}

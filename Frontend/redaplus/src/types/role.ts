import { IUserItem } from './user';

export type IRoleTableFilterValue = string | string[] | Date | null;

export type IRoleTableFilters = {
  name: string | undefined;
  active: boolean | undefined | any;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
};

export type IPermission = {
  id: string;
  name: string;
  slug: string;
  group_label: string;
  rolePermission: IRolePermission[];
  created_at: Date;
  updated_at?: Date;
};

export type IRolePermission = {
  id: string;
  role_id: string;
  permission_slug: string;
  role: IRole;
  permission: IPermission;
  created_at: Date;
  updated_at?: Date;
};

export type IRole = {
  _count?: {
    users: number;
  };
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  is_admin: boolean;
  rolePermissions: IRolePermission[];
  permission_slug: string[];
  users: Partial<IUserItem[]>;

  created_at: Date | null;
  updated_at?: Date | null;
};

export const ROLE_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'role-status-ativo' },
  { value: 'false', label: 'Inativo', dataCy: 'role-status-inativo' },
];

export const ROLE_ADMIN_OPTIONS = [
  { value: 'true', label: 'Admin' },
  { value: 'false', label: 'Não é Admin' },
];

export enum PermissionSlug {
  'upload-raw-videos' = 'upload-raw-videos',
  'view-raw-videos' = 'view-raw-videos',
  'edit-raw-videos' = 'edit-raw-videos',
  'delete-raw-videos' = 'delete-raw-videos',
  'download-raw-videos' = 'download-raw-videos',
  'preview-raw-videos' = 'preview-raw-videos',
  'view-content' = 'view-content',
  'upload-content' = 'upload-content',
  'edit-content' = 'edit-content',
  'delete-content' = 'delete-content',
  'download-content' = 'download-content',
  'view-preview-content' = 'view-preview-content',
  'upload-subtitle' = 'upload-subtitle',
  'download-subtitle' = 'download-subtitle',
  'delete-subtitle' = 'delete-subtitle',
  'add-channels' = 'add-channels',
  'view-channels' = 'view-channels',
  'edit-channels' = 'edit-channels',
  'delete-channels' = 'delete-channels',
  'view-profile-channels' = 'view-profile-channels',
  'add-tag' = 'add-tag',
  'view-tags' = 'view-tags',
  'edit-tags' = 'edit-tags',
  'delete-tags' = 'delete-tags',
  'add-categories' = 'add-categories',
  'view-categories' = 'view-categories',
  'edit-categories' = 'edit-categories',
  'delete-categories' = 'delete-categories',
  'add-roles' = 'add-roles',
  'view-roles' = 'view-roles',
  'edit-roles' = 'edit-roles',
  'delete-roles' = 'delete-roles',
  'add-users' = 'add-users',
  'view-users' = 'view-users',
  'edit-users' = 'edit-users',
  'delete-users' = 'delete-users',
  'view-logs' = 'view-logs',
  'view-list' = 'view-list',
  'view-statistics' = 'view-statistics',
  'view-statistics-traffic' = 'view-statistics-traffic',
  'add-playlists' = 'add-playlists',
  'view-playlists' = 'view-playlists',
  'edit-playlists' = 'edit-playlists',
  'delete-playlists' = 'delete-playlists',
}

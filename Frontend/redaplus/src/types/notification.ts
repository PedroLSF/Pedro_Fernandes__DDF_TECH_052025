import { IUserItem } from './user';

export type INotification = {
  id: string;
  title: string;
  content: string;
  slug: string;
  read_at: Date | null;
  archived_at: Date | null;
  resource_id: string;
  resource_type: string;
  user_id: string;
  created_at: Date;
  updated_at: Date | null;
  user: IUserItem;
  resource: AnyObject;
};

export type NotificationItemProps = {
  data: INotification;
};

export type INotificationTabFilters = {
  read_at: string;
  archived_at: string;
};

export type INotificationTabFilterValue = string | string[];

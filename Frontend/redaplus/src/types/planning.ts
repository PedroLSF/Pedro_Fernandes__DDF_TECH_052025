import { IUserItem } from './content';

export type IPlanningItem = {
  id: string;
  title: string;
  theme: string;
  text: string;

  user_id: string;
  user: IUserItem;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
};

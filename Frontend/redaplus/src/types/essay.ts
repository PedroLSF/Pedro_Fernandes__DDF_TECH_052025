import { IUserItem } from './content';

export const essayStatusTranslation = {
  Submitted: 'Enviada',
  Reviewed: 'Corrigida',
};

export const stateIcons = {
  Submitted: 'mdi:cloud-check-outline',
  Reviewed: 'mdi:check-circle-outline',
};

export type IEssayTableFilters = {
  title: string | undefined | any;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
};

export enum EssayStatusType {
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
}
export type IEssayItem = {
  id: string;
  title: string;
  text: string;
  theme: string;
  note: number | null;

  status: EssayStatusType;

  user_id: string;
  user: IUserItem;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
};

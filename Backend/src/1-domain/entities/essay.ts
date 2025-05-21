import { IUser } from './user';

export enum EssayStatusType {
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
}

export type EssayPerThemeItem = {
  theme: string;
  count: number;
};

export type EssayPerStatusItem = {
  status: string;
  count: number;
};

export type EssayPerMonthItem = {
  month: string;
  count: number;
};

export type EssayAvgItem = {
  month: string;
  avg: number;
};

export interface IEssay {
  id: string;
  title: string;
  text: string;
  theme: string;
  note?: number | null;
  status: EssayStatusType;

  user_id: string;
  user: IUser;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface InputEssay extends Omit<IEssay, 'id' | 'user'> {
  // custom stuff...
}

export class EssayEntity implements IEssay {
  id: string;
  title: string;
  text: string;
  theme: string;
  note?: number | null;
  status: EssayStatusType;

  user_id: string;
  user: IUser;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

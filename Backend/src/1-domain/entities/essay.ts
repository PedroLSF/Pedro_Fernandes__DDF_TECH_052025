import { IUser } from './user';

export enum EssayStatusType {
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
}

export interface IEssay {
  id: string;
  title: string;
  text: string;
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
  status: EssayStatusType;

  user_id: string;
  user: IUser;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

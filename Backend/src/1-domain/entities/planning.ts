import { IEssay } from './essay';
import { IUser } from './user';

export interface IPlanning {
  id: string;
  title: string;
  theme: string;

  user_id: string;
  user: IUser;
  essay_id: string;
  essay: IEssay;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface InputPlanning
  extends Omit<IPlanning, 'id' | 'user' | 'essay'> {
  // custom stuff...
}

export class PlanningEntity implements IPlanning {
  id: string;
  title: string;
  theme: string;

  user_id: string;
  user: IUser;
  essay_id: string;
  essay: IEssay;

  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

import { Entity } from '@framework/serializers/common/abstractEntity';
import { IPlanning } from '@domain/entities/planning';
import { IUser } from '@domain/entities/user';
import { IEssay } from '@domain/entities/essay';

export class PlanningEntity
  extends Entity<PlanningEntity>
  implements IPlanning
{
  id: string;
  title: string;
  theme: string;
  text: string;

  user_id: string;
  user: IUser;

  essay_id: string;
  essay: IEssay;

  created_at: Date;
  updated_at: Date | null;
  deleted_at?: Date;
}

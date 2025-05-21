import { Entity } from '@framework/serializers/common/abstractEntity';
import { EssayStatusType, IEssay } from '@domain/entities/essay';
import { IUser } from '@domain/entities/user';

export class EssayEntity extends Entity<EssayEntity> implements IEssay {
  id: string;
  title: string;
  text: string;

  user_id: string;
  user: IUser;

  status: EssayStatusType;
  active?: boolean;
  created_at: Date;
  updated_at: Date | null;
  deleted_at?: Date;
}

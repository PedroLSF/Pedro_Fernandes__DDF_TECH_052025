import { Entity } from '@framework/serializers/common/abstractEntity';
import { IUser } from '@domain/entities/user';

export class UserEntity extends Entity<UserEntity> implements IUser {
  name: string;
  password: string;
  biography: string | null;
  email: string;
  github_link: string | null;
  id: string;
  is_master: boolean;
  phone: string | null;
  status: boolean | null;
  active?: boolean;
  created_at: Date;
  updated_at: Date | null;
  deleted_at?: Date;
}

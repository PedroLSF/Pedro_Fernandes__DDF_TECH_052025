export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  is_master: boolean;
  phone?: string | null;
  biography?: string | null;
  active?: boolean | null;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface InputUser extends Omit<IUser, 'id' | 'is_master'> {
  // custom stuff...
}

export class UserEntity implements IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  is_master: boolean;
  phone?: string | null;
  biography?: string | null;
  active?: boolean | null;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

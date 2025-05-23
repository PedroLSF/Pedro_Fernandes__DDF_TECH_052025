import { Either } from '@shared/either';
import { IError } from '@shared/error';
import { InputUser, IUser } from '@domain/entities/user';

// create
export type InputCreateUserRepositoryDto = InputUser & { id: string };
export type OutputCreateUserRepositoryDto = Either<IError, IUser>;

// update
export type InputUpdateUserRepositoryDto = {
  id: string;
  data: Partial<InputUser>;
};
export type OutputUpdateUserRepositoryDto = Either<IError, IUser>;

// list
export type InputListUserRepositoryDto = {
  take: number;
  skip: number;
  filter?: Partial<Record<keyof IUser, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
  order?: Partial<Record<keyof IUser, 'desc' | 'asc'>>;
};
export type OutputListUserRepositoryDto = Either<IError, IUser[]>;

// count
export type InputCountUserRepositoryDto = {
  filter?: Partial<Record<keyof IUser, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
};
export type OutputCountUserRepositoryDto = Either<IError, number>;

// findBy
export type InputFindByUserRepositoryDto = {
  type: keyof IUser;
  value: string | number;
};
export type OutputFindByUserRepositoryDto = Either<IError, IUser>;

// delete
export type InputDeleteUserRepositoryDto = { id: string };
export type OutputDeleteUserRepositoryDto = Either<IError, boolean>;

export interface IUserRepository {
  create: (
    input: InputCreateUserRepositoryDto,
  ) => Promise<OutputCreateUserRepositoryDto>;
  list: (
    input: InputListUserRepositoryDto,
  ) => Promise<OutputListUserRepositoryDto>;
  count: (
    input: InputCountUserRepositoryDto,
  ) => Promise<OutputCountUserRepositoryDto>;
  findBy: (
    input: InputFindByUserRepositoryDto,
  ) => Promise<OutputFindByUserRepositoryDto>;
  update: (
    input: InputUpdateUserRepositoryDto,
  ) => Promise<OutputUpdateUserRepositoryDto>;
  delete: (
    input: InputDeleteUserRepositoryDto,
  ) => Promise<OutputDeleteUserRepositoryDto>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');

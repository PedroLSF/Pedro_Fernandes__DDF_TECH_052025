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
};
export type OutputListUserRepositoryDto = Either<IError, IUser[]>;

// count
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
  count: () => Promise<OutputCountUserRepositoryDto>;
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

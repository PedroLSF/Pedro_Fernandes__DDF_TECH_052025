import { Either } from '@shared/either';
import { IError } from '@shared/error';
import { InputEssay, IEssay } from '@domain/entities/essay';

// create
export type InputCreateEssayRepositoryDto = InputEssay;
export type OutputCreateEssayRepositoryDto = Either<IError, IEssay>;

// update
export type InputUpdateEssayRepositoryDto = {
  id: string;
  data: Partial<InputEssay>;
};
export type OutputUpdateEssayRepositoryDto = Either<IError, IEssay>;

// list
export type InputListEssayRepositoryDto = {
  take: number;
  skip: number;
  filter?: Partial<Record<keyof IEssay, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
  order?: Partial<Record<keyof IEssay, 'desc' | 'asc'>>;
};
export type OutputListEssayRepositoryDto = Either<IError, IEssay[]>;

// count
export type InputCountEssayRepositoryDto = {
  filter?: Partial<Record<keyof IEssay, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
};
export type OutputCountEssayRepositoryDto = Either<IError, number>;

// findBy
export type InputFindByEssayRepositoryDto = {
  type: keyof IEssay;
  value: string | number;
};
export type OutputFindByEssayRepositoryDto = Either<IError, IEssay>;

// delete
export type InputDeleteEssayRepositoryDto = { id: string };
export type OutputDeleteEssayRepositoryDto = Either<IError, boolean>;

export interface IEssayRepository {
  create: (
    input: InputCreateEssayRepositoryDto,
  ) => Promise<OutputCreateEssayRepositoryDto>;
  list: (
    input: InputListEssayRepositoryDto,
  ) => Promise<OutputListEssayRepositoryDto>;
  count: (
    input: InputCountEssayRepositoryDto,
  ) => Promise<OutputCountEssayRepositoryDto>;
  findBy: (
    input: InputFindByEssayRepositoryDto,
  ) => Promise<OutputFindByEssayRepositoryDto>;
  update: (
    input: InputUpdateEssayRepositoryDto,
  ) => Promise<OutputUpdateEssayRepositoryDto>;
  delete: (
    input: InputDeleteEssayRepositoryDto,
  ) => Promise<OutputDeleteEssayRepositoryDto>;
}

export const IEssayRepositoryToken = Symbol('IEssayRepository');

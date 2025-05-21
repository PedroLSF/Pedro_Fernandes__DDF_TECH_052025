import { Either } from '@shared/either';
import { IError } from '@shared/error';
import {
  InputEssay,
  IEssay,
  EssayPerMonthItem,
  EssayPerThemeItem,
  EssayPerStatusItem,
  EssayAvgItem,
} from '@domain/entities/essay';

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

//getEssaysPerMonth
export type InputEssayPerMonthRepositoryDto = {
  userId?: string;
};
export type OutputEssayPerMonthRepositoryDto = Either<
  IError,
  EssayPerMonthItem[]
>;

//getEssaysPerTheme
export type InputEssayPerThemeRepositoryDto = {
  userId?: string;
};
export type OutputEssayPerThemeRepositoryDto = Either<
  IError,
  EssayPerThemeItem[]
>;

//getEssaysPerStatus
export type InputEssayPerStatusRepositoryDto = {
  userId?: string;
};
export type OutputEssayPerStatusRepositoryDto = Either<
  IError,
  EssayPerStatusItem[]
>;

//getEssaysAvg
export type InputEssayAvgRepositoryDto = {
  userId?: string;
};
export type OutputEssayAvgRepositoryDto = Either<IError, EssayAvgItem[]>;

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
  getEssaysPerMonth: (
    query: InputEssayPerMonthRepositoryDto,
  ) => Promise<OutputEssayPerMonthRepositoryDto>;
  getEssaysPerTheme: (
    query: InputEssayPerThemeRepositoryDto,
  ) => Promise<OutputEssayPerThemeRepositoryDto>;
  getEssaysPerStatus: (
    query: InputEssayPerStatusRepositoryDto,
  ) => Promise<OutputEssayPerStatusRepositoryDto>;
  getEssaysAvgNote: (
    query: InputEssayAvgRepositoryDto,
  ) => Promise<OutputEssayAvgRepositoryDto>;
}

export const IEssayRepositoryToken = Symbol('IEssayRepository');

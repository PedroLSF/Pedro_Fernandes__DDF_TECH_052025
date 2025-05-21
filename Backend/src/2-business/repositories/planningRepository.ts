import { Either } from '@shared/either';
import { IError } from '@shared/error';
import { InputPlanning, IPlanning } from '@domain/entities/planning';

// create
export type InputCreatePlanningRepositoryDto = InputPlanning;
export type OutputCreatePlanningRepositoryDto = Either<IError, IPlanning>;

// update
export type InputUpdatePlanningRepositoryDto = {
  id: string;
  data: Partial<InputPlanning>;
};
export type OutputUpdatePlanningRepositoryDto = Either<IError, IPlanning>;

// list
export type InputListPlanningRepositoryDto = {
  take: number;
  skip: number;
  filter?: Partial<Record<keyof IPlanning, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
  order?: Partial<Record<keyof IPlanning, 'desc' | 'asc'>>;
};
export type OutputListPlanningRepositoryDto = Either<IError, IPlanning[]>;

// count
export type InputCountPlanningRepositoryDto = {
  filter?: Partial<Record<keyof IPlanning, any>> & {
    start_date?: string | Date;
    end_date?: string | Date;
  };
};
export type OutputCountPlanningRepositoryDto = Either<IError, number>;

// findBy
export type InputFindByPlanningRepositoryDto = {
  type: keyof IPlanning;
  value: string | number;
};
export type OutputFindByPlanningRepositoryDto = Either<IError, IPlanning>;

// delete
export type InputDeletePlanningRepositoryDto = { id: string };
export type OutputDeletePlanningRepositoryDto = Either<IError, boolean>;

export interface IPlanningRepository {
  create: (
    input: InputCreatePlanningRepositoryDto,
  ) => Promise<OutputCreatePlanningRepositoryDto>;
  list: (
    input: InputListPlanningRepositoryDto,
  ) => Promise<OutputListPlanningRepositoryDto>;
  count: (
    input: InputCountPlanningRepositoryDto,
  ) => Promise<OutputCountPlanningRepositoryDto>;
  findBy: (
    input: InputFindByPlanningRepositoryDto,
  ) => Promise<OutputFindByPlanningRepositoryDto>;
  update: (
    input: InputUpdatePlanningRepositoryDto,
  ) => Promise<OutputUpdatePlanningRepositoryDto>;
  delete: (
    input: InputDeletePlanningRepositoryDto,
  ) => Promise<OutputDeletePlanningRepositoryDto>;
}

export const IPlanningRepositoryToken = Symbol('IPlanningRepository');

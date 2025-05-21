import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';
import {
  InputPlanning,
  IPlanning,
  PlanningEntity,
} from '@domain/entities/planning';

export type InputUpdatePlanningDto = Pick<IPlanning, 'id'> & {
  data: Partial<InputPlanning>;
};
export type OutputUpdatePlanningDto = Either<IError, PlanningEntity>;

@Injectable()
export class UpdatePlanningUseCase
  implements IUseCase<InputUpdatePlanningDto, OutputUpdatePlanningDto>
{
  private readonly logger: Logger = new Logger(UpdatePlanningUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(
    input: InputUpdatePlanningDto,
  ): Promise<OutputUpdatePlanningDto> {
    const planningFound = await this.planningRepository.findBy({
      type: 'id',
      value: input.id,
    });

    if (planningFound.isLeft()) {
      return left(planningFound.value);
    }

    const planning = await this.planningRepository.update({
      id: input.id,
      data: input.data,
    });

    if (planning.isLeft()) {
      return left(planning.value);
    }

    return right(planning.value);
  }
}

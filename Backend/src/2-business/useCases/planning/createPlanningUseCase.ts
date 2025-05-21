import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IPlanningRepository,
  IPlanningRepositoryToken,
  InputCreatePlanningRepositoryDto,
} from '@business/repositories/planningRepository';
import { PlanningEntity } from '@domain/entities/planning';

export type InputCreatePlanningDto = InputCreatePlanningRepositoryDto;
export type OutputCreatePlanningDto = Either<IError, PlanningEntity>;

@Injectable()
export class CreatePlanningUseCase
  implements IUseCase<InputCreatePlanningDto, OutputCreatePlanningDto>
{
  private readonly logger: Logger = new Logger(CreatePlanningUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(
    input: InputCreatePlanningDto,
  ): Promise<OutputCreatePlanningDto> {
    const planning = await this.planningRepository.create(input);

    if (planning.isLeft()) {
      return left(planning.value);
    }
    return right(planning.value);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';

import {
  IPlanningRepository,
  IPlanningRepositoryToken,
  InputPlanningPerMonthRepositoryDto,
  OutputPlanningPerMonthRepositoryDto,
} from '@business/repositories/planningRepository';

export type InputPlanningPerMonthDto = InputPlanningPerMonthRepositoryDto;
export type OutputPlanningPerMonthDto = OutputPlanningPerMonthRepositoryDto;

@Injectable()
export class GetPlanningsPerMonthUseCase
  implements IUseCase<InputPlanningPerMonthDto, OutputPlanningPerMonthDto>
{
  private readonly logger: Logger = new Logger(
    GetPlanningsPerMonthUseCase.name,
    {
      timestamp: true,
    },
  );
  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(
    query: InputPlanningPerMonthDto,
  ): Promise<OutputPlanningPerMonthDto> {
    const plannings = await this.planningRepository.getPlanningsPerMonth(query);
    if (plannings.isLeft()) {
      return left(plannings.value);
    }
    return right(plannings.value);
  }
}

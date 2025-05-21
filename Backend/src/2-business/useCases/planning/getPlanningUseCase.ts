import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';
import {
  IPlanningRepository,
  IPlanningRepositoryToken,
  OutputFindByPlanningRepositoryDto,
} from '@business/repositories/planningRepository';
import { planningFindByError } from '@business/errors/planning';

export type InputGetPlanningDto = {
  by: 'id' | 'title' | 'user_id';
  value: string;
};
export type OutputGetPlanningDto = OutputFindByPlanningRepositoryDto;

@Injectable()
export class GetPlanningUseCase
  implements IUseCase<InputGetPlanningDto, OutputGetPlanningDto>
{
  private readonly logger: Logger = new Logger(GetPlanningUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }
  async execute(input: InputGetPlanningDto): Promise<OutputGetPlanningDto> {
    const getPlanning = await this.planningRepository.findBy({
      type: input.by,
      value: input.value,
    });

    if (getPlanning.isLeft()) {
      return left(getPlanning.value);
    }

    return right(getPlanning.value);
  }
}

import { Either, left, right } from '@shared/either';
import { IUseCase } from '../iUseCase';
import { IError } from '@shared/error';
import { Inject, Logger } from '@nestjs/common';
import {
  InputCountPlanningRepositoryDto,
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';

export type InputCountPlanningDto = InputCountPlanningRepositoryDto;
export type OutputCountPlanningDto = Either<IError, number>;

export class CountPlanningUseCase
  implements IUseCase<undefined, OutputCountPlanningDto>
{
  private readonly logger: Logger = new Logger(CountPlanningUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly PlanningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputCountPlanningDto): Promise<OutputCountPlanningDto> {
    const output = await this.PlanningRepository.count(input);

    if (output.isLeft()) {
      return left(output.value);
    }

    return right(output.value);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';
import { IPlanning } from '@domain/entities/planning';

export type InputDeletePlanningDto = Pick<IPlanning, 'id'>;
export type OutputDeletePlanningDto = Either<IError, boolean>;

@Injectable()
export class DeletePlanningUseCase
  implements IUseCase<InputDeletePlanningDto, OutputDeletePlanningDto>
{
  private readonly logger: Logger = new Logger(DeletePlanningUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(
    input: InputDeletePlanningDto,
  ): Promise<OutputDeletePlanningDto> {
    const remove = await this.planningRepository.delete({
      id: input.id,
    });
    if (remove.isLeft()) {
      return left(remove.value);
    }
    return right(remove.value);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { Paginated, paginate } from '@shared/pagination';
import { IError } from '@shared/error';
import { IPlanning } from '@domain/entities/planning';
import {
  InputListPlanningRepositoryDto,
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';

export type InputListPlanningDto = InputListPlanningRepositoryDto;
export type OutputListPlanningDto = Either<
  IError,
  Paginated<Omit<IPlanning, 'top_secret_prop'>>
>;

@Injectable()
export class ListPlanningUseCase
  implements IUseCase<InputListPlanningDto, OutputListPlanningDto>
{
  private readonly logger: Logger = new Logger(ListPlanningUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IPlanningRepositoryToken)
    private readonly planningRepository: IPlanningRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputListPlanningDto): Promise<OutputListPlanningDto> {
    const [countOutput, listOutput] = await Promise.all([
      this.planningRepository.count(input),
      this.planningRepository.list(input),
    ]);

    if (countOutput.isLeft()) {
      return left(countOutput.value);
    }

    if (listOutput.isLeft()) {
      return left(listOutput.value);
    }

    const count = countOutput.value;
    const plannings = listOutput.value;

    return right(
      paginate({
        results: plannings ?? [],
        total: count ?? 0,
        skip: input.skip,
        take: input.take,
      }),
    );
  }
}

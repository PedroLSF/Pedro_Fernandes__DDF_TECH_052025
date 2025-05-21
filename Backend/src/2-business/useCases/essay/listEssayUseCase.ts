import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { Paginated, paginate } from '@shared/pagination';
import { IError } from '@shared/error';
import { IEssay } from '@domain/entities/essay';
import {
  InputListEssayRepositoryDto,
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';

export type InputListEssayDto = InputListEssayRepositoryDto;
export type OutputListEssayDto = Either<
  IError,
  Paginated<Omit<IEssay, 'top_secret_prop'>>
>;

@Injectable()
export class ListEssayUseCase
  implements IUseCase<InputListEssayDto, OutputListEssayDto>
{
  private readonly logger: Logger = new Logger(ListEssayUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputListEssayDto): Promise<OutputListEssayDto> {
    const [countOutput, listOutput] = await Promise.all([
      this.essayRepository.count(input),
      this.essayRepository.list(input),
    ]);

    if (countOutput.isLeft()) {
      return left(countOutput.value);
    }

    if (listOutput.isLeft()) {
      return left(listOutput.value);
    }

    const count = countOutput.value;
    const essays = listOutput.value;

    return right(
      paginate({
        results: essays ?? [],
        total: count ?? 0,
        skip: input.skip,
        take: input.take,
      }),
    );
  }
}

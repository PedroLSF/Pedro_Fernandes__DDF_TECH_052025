import { Either, left, right } from '@shared/either';
import { IUseCase } from '../iUseCase';
import { IError } from '@shared/error';
import { Inject, Logger } from '@nestjs/common';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { InputCountEssayRepositoryDto } from '@business/repositories/essayRepository';

export type InputCountEssayDto = InputCountEssayRepositoryDto;
export type OutputCountEssayDto = Either<IError, number>;

export class CountEssayUseCase
  implements IUseCase<undefined, OutputCountEssayDto>
{
  private readonly logger: Logger = new Logger(CountEssayUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputCountEssayDto): Promise<OutputCountEssayDto> {
    const output = await this.essayRepository.count(input);

    if (output.isLeft()) {
      return left(output.value);
    }

    return right(output.value);
  }
}

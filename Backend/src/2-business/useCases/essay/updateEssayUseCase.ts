import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { InputEssay, IEssay, EssayEntity } from '@domain/entities/essay';

export type InputUpdateEssayDto = Pick<IEssay, 'id'> & {
  data: Partial<InputEssay>;
};
export type OutputUpdateEssayDto = Either<IError, EssayEntity>;

@Injectable()
export class UpdateEssayUseCase
  implements IUseCase<InputUpdateEssayDto, OutputUpdateEssayDto>
{
  private readonly logger: Logger = new Logger(UpdateEssayUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputUpdateEssayDto): Promise<OutputUpdateEssayDto> {
    const essayFound = await this.essayRepository.findBy({
      type: 'id',
      value: input.id,
    });

    if (essayFound.isLeft()) {
      return left(essayFound.value);
    }

    const essay = await this.essayRepository.update({
      id: input.id,
      data: input.data,
    });

    if (essay.isLeft()) {
      return left(essay.value);
    }

    return right(essay.value);
  }
}

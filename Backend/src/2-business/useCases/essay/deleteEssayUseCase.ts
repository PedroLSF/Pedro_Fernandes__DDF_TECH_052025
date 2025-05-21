import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { IEssay } from '@domain/entities/essay';

export type InputDeleteEssayDto = Pick<IEssay, 'id'>;
export type OutputDeleteEssayDto = Either<IError, boolean>;

@Injectable()
export class DeleteEssayUseCase
  implements IUseCase<InputDeleteEssayDto, OutputDeleteEssayDto>
{
  private readonly logger: Logger = new Logger(DeleteEssayUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputDeleteEssayDto): Promise<OutputDeleteEssayDto> {
    const remove = await this.essayRepository.delete({
      id: input.id,
    });
    if (remove.isLeft()) {
      return left(remove.value);
    }
    return right(remove.value);
  }
}

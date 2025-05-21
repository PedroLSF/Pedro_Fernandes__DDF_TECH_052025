import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputCreateEssayRepositoryDto,
} from '@business/repositories/essayRepository';
import { EssayEntity } from '@domain/entities/essay';

export type InputCreateEssayDto = InputCreateEssayRepositoryDto;
export type OutputCreateEssayDto = Either<IError, EssayEntity>;

@Injectable()
export class CreateEssayUseCase
  implements IUseCase<InputCreateEssayDto, OutputCreateEssayDto>
{
  private readonly logger: Logger = new Logger(CreateEssayUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputCreateEssayDto): Promise<OutputCreateEssayDto> {
    const essay = await this.essayRepository.create(input);

    if (essay.isLeft()) {
      return left(essay.value);
    }
    return right(essay.value);
  }
}

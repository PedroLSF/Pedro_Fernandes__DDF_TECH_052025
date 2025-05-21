import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';

import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputEssayPerStatusRepositoryDto,
  OutputEssayPerStatusRepositoryDto,
} from '@business/repositories/essayRepository';

export type InputEssayPerStatusDto = InputEssayPerStatusRepositoryDto;
export type OutputEssayPerStatusDto = OutputEssayPerStatusRepositoryDto;

@Injectable()
export class GetEssaysPerStatusUseCase
  implements IUseCase<InputEssayPerStatusDto, OutputEssayPerStatusDto>
{
  private readonly logger: Logger = new Logger(GetEssaysPerStatusUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(
    query: InputEssayPerStatusDto,
  ): Promise<OutputEssayPerStatusDto> {
    const essays = await this.essayRepository.getEssaysPerStatus(query);
    if (essays.isLeft()) {
      return left(essays.value);
    }
    return right(essays.value);
  }
}

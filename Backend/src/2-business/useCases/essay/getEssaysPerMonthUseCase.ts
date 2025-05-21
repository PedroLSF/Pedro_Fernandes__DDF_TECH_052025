import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';

import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputEssayPerMonthRepositoryDto,
  OutputEssayPerMonthRepositoryDto,
} from '@business/repositories/essayRepository';

export type InputEssayPerMonthDto = InputEssayPerMonthRepositoryDto;
export type OutputEssayPerMonthDto = OutputEssayPerMonthRepositoryDto;

@Injectable()
export class GetEssaysPerMonthUseCase
  implements IUseCase<InputEssayPerMonthDto, OutputEssayPerMonthDto>
{
  private readonly logger: Logger = new Logger(GetEssaysPerMonthUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(query: InputEssayPerMonthDto): Promise<OutputEssayPerMonthDto> {
    const essays = await this.essayRepository.getEssaysPerMonth(query);
    if (essays.isLeft()) {
      return left(essays.value);
    }
    return right(essays.value);
  }
}

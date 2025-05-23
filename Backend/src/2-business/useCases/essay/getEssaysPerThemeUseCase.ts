import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';

import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputEssayPerThemeRepositoryDto,
  OutputEssayPerThemeRepositoryDto,
} from '@business/repositories/essayRepository';

export type InputEssayPerMonthDto = InputEssayPerThemeRepositoryDto;
export type OutputEssayPerThemeDto = OutputEssayPerThemeRepositoryDto;

@Injectable()
export class GetEssaysPerThemeUseCase
  implements IUseCase<InputEssayPerMonthDto, OutputEssayPerThemeDto>
{
  private readonly logger: Logger = new Logger(GetEssaysPerThemeUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(query: InputEssayPerMonthDto): Promise<OutputEssayPerThemeDto> {
    const essays = await this.essayRepository.getEssaysPerTheme(query);
    if (essays.isLeft()) {
      return left(essays.value);
    }
    return right(essays.value);
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';

import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputEssayAvgRepositoryDto,
  OutputEssayAvgRepositoryDto,
} from '@business/repositories/essayRepository';

export type InputEssayAvgDto = InputEssayAvgRepositoryDto;
export type OutputEssayAvgDto = OutputEssayAvgRepositoryDto;

@Injectable()
export class GetEssaysAvgUseCase
  implements IUseCase<InputEssayAvgDto, OutputEssayAvgDto>
{
  private readonly logger: Logger = new Logger(GetEssaysAvgUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(query: InputEssayAvgDto): Promise<OutputEssayAvgDto> {
    const essays = await this.essayRepository.getEssaysAvgNote(query);
    if (essays.isLeft()) {
      return left(essays.value);
    }
    return right(essays.value);
  }
}

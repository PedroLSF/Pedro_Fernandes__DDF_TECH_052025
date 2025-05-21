import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
  OutputFindByEssayRepositoryDto,
} from '@business/repositories/essayRepository';
import { essayFindByError } from '@business/errors/essay';

export type InputGetEssayDto = {
  by: 'id' | 'title' | 'user_id';
  value: string;
};
export type OutputGetEssayDto = OutputFindByEssayRepositoryDto;

@Injectable()
export class GetEssayUseCase
  implements IUseCase<InputGetEssayDto, OutputGetEssayDto>
{
  private readonly logger: Logger = new Logger(GetEssayUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IEssayRepositoryToken)
    private readonly essayRepository: IEssayRepository,
  ) {
    this.logger.debug('new instance');
  }
  async execute(input: InputGetEssayDto): Promise<OutputGetEssayDto> {
    const getEssay = await this.essayRepository.findBy({
      type: input.by,
      value: input.value,
    });

    if (getEssay.isLeft()) {
      return left(getEssay.value);
    }

    return right(getEssay.value);
  }
}

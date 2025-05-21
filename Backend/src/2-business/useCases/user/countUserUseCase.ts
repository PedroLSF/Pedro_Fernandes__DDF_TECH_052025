import { Either, left, right } from '@shared/either';
import { IUseCase } from '../iUseCase';
import { IError } from '@shared/error';
import { Inject, Logger } from '@nestjs/common';
import {
  InputCountUserRepositoryDto,
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';

export type InputCountUserDto = InputCountUserRepositoryDto;
export type OutputCountUserDto = Either<IError, number>;

export class CountUserUseCase
  implements IUseCase<InputCountUserDto, OutputCountUserDto>
{
  private readonly logger: Logger = new Logger(CountUserUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputCountUserDto): Promise<OutputCountUserDto> {
    const output = await this.userRepository.count(input);

    if (output.isLeft()) {
      return left(output.value);
    }

    return right(output.value);
  }
}

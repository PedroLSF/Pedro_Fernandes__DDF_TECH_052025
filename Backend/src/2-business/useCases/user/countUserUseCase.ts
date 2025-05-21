import { Either, left, right } from '@shared/either';
import { IUseCase } from '../iUseCase';
import { IError } from '@shared/error';
import { Inject, Logger } from '@nestjs/common';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';

export type OutputCountUserDto = Either<IError, number>;

export class CountUserUseCase
  implements IUseCase<undefined, OutputCountUserDto>
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

  async execute(): Promise<OutputCountUserDto> {
    const output = await this.userRepository.count();

    if (output.isLeft()) {
      return left(output.value);
    }

    return right(output.value);
  }
}

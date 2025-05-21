import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { IUser } from '@domain/entities/user';

export type InputDeleteUserDto = Pick<IUser, 'id'>;
export type OutputDeleteUserDto = Either<IError, boolean>;

@Injectable()
export class DeleteUserUseCase
  implements IUseCase<InputDeleteUserDto, OutputDeleteUserDto>
{
  private readonly logger: Logger = new Logger(DeleteUserUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputDeleteUserDto): Promise<OutputDeleteUserDto> {
    const remove = await this.userRepository.delete({
      id: input.id,
    });
    if (remove.isLeft()) {
      return left(remove.value);
    }
    return right(remove.value);
  }
}

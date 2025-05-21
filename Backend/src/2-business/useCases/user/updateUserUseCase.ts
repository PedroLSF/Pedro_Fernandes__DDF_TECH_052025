import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { InputUser, IUser, UserEntity } from '@domain/entities/user';

export type InputUpdateUserDto = Pick<IUser, 'id'> & {
  data: Partial<InputUser>;
};
export type OutputUpdateUserDto = Either<IError, UserEntity>;

@Injectable()
export class UpdateUserUseCase
  implements IUseCase<InputUpdateUserDto, OutputUpdateUserDto>
{
  private readonly logger: Logger = new Logger(UpdateUserUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputUpdateUserDto): Promise<OutputUpdateUserDto> {
    const userFound = await this.userRepository.findBy({
      type: 'id',
      value: input.id,
    });

    if (userFound.isLeft()) {
      return left(userFound.value);
    }

    const user = await this.userRepository.update({
      id: input.id,
      data: input.data,
    });

    if (user.isLeft()) {
      return left(user.value);
    }

    return right(user.value);
  }
}

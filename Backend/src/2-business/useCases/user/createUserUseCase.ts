import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';

import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { InputUser, UserEntity } from '@domain/entities/user';

import {
  userCreateAlreadyExistsError,
  userNotFoundError,
} from '@business/errors/user';
import { generateId, IdPrefixes } from '@utils/id';

export type InputCreateUserDto = Omit<
  InputUser,
  'id' | 'created_at' | 'updated_at' | 'is_master'
>;
export type OutputCreateUserDto = Either<IError, UserEntity>;

@Injectable()
export class CreateUserUseCase
  implements IUseCase<InputCreateUserDto, OutputCreateUserDto>
{
  private readonly logger: Logger = new Logger(CreateUserUseCase.name, {
    timestamp: true,
  });

  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const existUser = await this.userRepository.findBy({
      type: 'email',
      value: input.email,
    });

    if (existUser.isRight()) {
      return left(userCreateAlreadyExistsError);
    }

    if (existUser.isLeft() && existUser.value.code !== userNotFoundError.code) {
      return left(existUser.value);
    }

    const userId = generateId(IdPrefixes.user);

    const user = await this.userRepository.create({
      ...input,
      id: userId,
    });

    if (user.isLeft()) {
      return left(user.value);
    }
    return right(user.value);
  }
}

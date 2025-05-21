import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { left, right } from '@shared/either';
import {
  IUserRepository,
  IUserRepositoryToken,
  OutputFindByUserRepositoryDto,
} from '@business/repositories/userRepository';
import { userFindByError } from '@business/errors/user';

export type InputGetUserDto = {
  by: 'id' | 'email' | 'name';
  value: string;
};
export type OutputGetUserDto = OutputFindByUserRepositoryDto;

@Injectable()
export class GetUserUseCase
  implements IUseCase<InputGetUserDto, OutputGetUserDto>
{
  private readonly logger: Logger = new Logger(GetUserUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }
  async execute(input: InputGetUserDto): Promise<OutputGetUserDto> {
    if (false === ['id', 'email', 'identity_provider_id'].includes(input.by)) {
      return left(userFindByError);
    }

    const getUser = await this.userRepository.findBy({
      type: input.by,
      value: input.value,
    });

    if (getUser.isLeft()) {
      return left(getUser.value);
    }

    return right(getUser.value);
  }
}

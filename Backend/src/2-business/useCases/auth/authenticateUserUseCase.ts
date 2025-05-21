import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '@business/useCases/iUseCase';
import { Either, left, right } from '@shared/either';
import { IUser } from '@domain/entities/user';

import { GetUserUseCase } from '@business/useCases/user/getUserUseCase';
import { handleErrorLog, IError } from '@shared/error';
import { IJwtService, IJwtServiceToken } from '@business/services/jwtService';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { notAuthorizedError } from '@business/errors/generic';

export type InputAuthenticateUserWithPasswordDto = {
  username: string;
  password: string;
};
export type OutputAuthenticateUserWithPasswordDto = Either<
  IError,
  { access_token: string }
>;

@Injectable()
export class AuthenticateUserUseCase
  implements
    IUseCase<
      InputAuthenticateUserWithPasswordDto,
      OutputAuthenticateUserWithPasswordDto
    >
{
  private readonly logger: Logger = new Logger(AuthenticateUserUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IJwtServiceToken)
    private readonly jwtService: IJwtService,
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    private readonly getUserUseCase: GetUserUseCase,
  ) {
    this.logger.debug('new instance');
  }
  async execute(
    input: InputAuthenticateUserWithPasswordDto,
  ): Promise<OutputAuthenticateUserWithPasswordDto> {
    const getUser = await this.getUserUseCase.execute({
      by: 'email',
      value: input.username,
    });

    if (getUser.isLeft()) {
      handleErrorLog(getUser.value, this.logger);
      return left(notAuthorizedError);
    }

    const authenticated = await this.jwtService.sign({
      payload: { sub: getUser.value.id, email: getUser.value.email },
    });

    if (authenticated.isLeft()) {
      handleErrorLog(authenticated.value, this.logger);
      return left(authenticated.value);
    }

    return right({ access_token: authenticated.value });
  }
}

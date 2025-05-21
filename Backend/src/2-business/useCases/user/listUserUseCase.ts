import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUseCase } from '../iUseCase';
import { Either, left, right } from '@shared/either';
import { Paginated, paginate } from '@shared/pagination';
import { IError } from '@shared/error';
import { IUser } from '@domain/entities/user';
import {
  InputListUserRepositoryDto,
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';

export type InputListUserDto = InputListUserRepositoryDto;
export type OutputListUserDto = Either<
  IError,
  Paginated<Omit<IUser, 'top_secret_prop'>>
>;

@Injectable()
export class ListUserUseCase
  implements IUseCase<InputListUserDto, OutputListUserDto>
{
  private readonly logger: Logger = new Logger(ListUserUseCase.name, {
    timestamp: true,
  });
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {
    this.logger.debug('new instance');
  }

  async execute(input: InputListUserDto): Promise<OutputListUserDto> {
    const [countOutput, listOutput] = await Promise.all([
      this.userRepository.count(input),
      this.userRepository.list(input),
    ]);

    if (countOutput.isLeft()) {
      return left(countOutput.value);
    }

    if (listOutput.isLeft()) {
      return left(listOutput.value);
    }

    const count = countOutput.value;
    const users = listOutput.value;

    return right(
      paginate({
        results: users ?? [],
        total: count ?? 0,
        skip: input.skip,
        take: input.take,
      }),
    );
  }
}

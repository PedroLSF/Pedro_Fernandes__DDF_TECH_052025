import { AppModule } from '../../../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Left, Right, left, right } from '@shared/either';
import { disableExternalServices } from '@utils/test';
import { InputListUserDto, ListUserUseCase } from './listUserUseCase';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { IUser } from '@domain/entities/user';
import { userListError } from '@business/errors/user';

describe('ListUserUseCase', () => {
  let listUserUseCase: ListUserUseCase;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        imports: [AppModule],
      }),
    ).compile();

    listUserUseCase = app.get<ListUserUseCase>(ListUserUseCase);
    userRepository = app.get<IUserRepository>(IUserRepositoryToken);
  });

  it('should be defined', async () => {
    expect(listUserUseCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should list a User', async () => {
    const mockUser: InputListUserDto = {
      take: 10,
      skip: 0,
    };

    const mockUsers: IUser[] = [
      {
        id: '123',
        is_master: false,
        name: 'name',
        password: '123',
        email: 'email@email',
      },
    ];

    jest.spyOn(userRepository, 'count').mockResolvedValue(right(1));
    jest.spyOn(userRepository, 'list').mockResolvedValue(right(mockUsers));

    const response = await listUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Right);
    expect.objectContaining(response);
    expect(response.value).toHaveProperty('take');
    expect(response.value).toHaveProperty('skip');
  });

  it('should not list a User', async () => {
    const mockUser: InputListUserDto = {
      take: 10,
      skip: 0,
    };

    jest.spyOn(userRepository, 'count').mockResolvedValue(right(1));
    jest.spyOn(userRepository, 'list').mockResolvedValue(left(userListError));

    const response = await listUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isLeft()).toBeTruthy();
    expect(response).toBeInstanceOf(Left);
    expect(response.value).toHaveProperty('httpCode');
    expect(response.value).toHaveProperty('code');
    expect.objectContaining(response);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { disableExternalServices } from '@utils/test';
import { AppModule } from '../../../app.module';
import { CreateUserUseCase, InputCreateUserDto } from './createUserUseCase';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { Left, Right, left, right } from '@shared/either';
import { UserEntity } from '@domain/entities/user';
import { userCreateError, userNotFoundError } from '@business/errors/user';

describe('createUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        imports: [AppModule],
      }),
    ).compile();
    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = app.get<IUserRepository>(IUserRepositoryToken);
  });

  it('should be defined', async () => {
    expect(createUserUseCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should return a created User', async () => {
    const mockUser: UserEntity = {
      name: 'mockUser',
      is_master: false,
      email: 'mockUser@email.com',
      id: 'mockUserId',
      password: '123',
    };

    jest
      .spyOn(userRepository, 'findBy')
      .mockResolvedValue(left(userNotFoundError));

    jest.spyOn(userRepository, 'create').mockResolvedValue(right(mockUser));
    jest
      .spyOn(createUserUseCase['awsCognitoService'], 'getCognitoUser')
      .mockResolvedValue(right({ name: 'teste', cognito_id: '123' }));

    const response = await createUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isRight()).toBeTruthy();
    expect(response).toBeInstanceOf(Right);
    expect(response.value).toHaveProperty('name');
    expect(response.value).toHaveProperty('email');
    expect(response.value).toHaveProperty('id');
    expect(response.value).toHaveProperty('identity_provider');
    expect(response.value).toHaveProperty('identity_provider_id');
    expect.objectContaining(response);
  });

  it('should not create a user and return a error', async () => {
    const mockUser: InputCreateUserDto = {
      email: 'email@email.com',
      name: 'name',
      password: '123',
    };

    jest
      .spyOn(userRepository, 'findBy')
      .mockResolvedValue(right(mockUser as UserEntity));

    jest
      .spyOn(userRepository, 'create')
      .mockResolvedValue(left(userCreateError));
    const response = await createUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Left);
    expect(response.value).toHaveProperty('httpCode');
    expect(response.value).toHaveProperty('code');
    expect.objectContaining(response);
  });
});

import { AppModule } from '../../../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Left, Right, left, right } from '@shared/either';
import { disableExternalServices } from '@utils/test';
import { InputUpdateUserDto, UpdateUserUseCase } from './updateUserUseCase';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { UserEntity } from '@domain/entities/user';
import { userUpdateError } from '@business/errors/user';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        imports: [AppModule],
      }),
    ).compile();

    updateUserUseCase = app.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = app.get<IUserRepository>(IUserRepositoryToken);
  });

  it('should be defined', async () => {
    expect(updateUserUseCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should return a updated User', async () => {
    const mockUser: InputUpdateUserDto = {
      id: '123-321',
      data: {
        email: 'newEmail@email.com',
        name: 'new name',
      },
    };
    const mockUpdatedUser: UserEntity = {
      id: '123-321',
      name: 'new name',
      is_master: false,
      email: 'newEmail@email.com',
      password: '123',
    };
    jest
      .spyOn(userRepository, 'findBy')
      .mockResolvedValue(right(mockUpdatedUser));
    jest
      .spyOn(userRepository, 'update')
      .mockResolvedValue(right(mockUpdatedUser));
    const response = await updateUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isRight()).toBeTruthy();
    expect(response).toBeInstanceOf(Right);
    expect(response.value).toHaveProperty('id');
    expect(response.value).toHaveProperty('name');
    expect(response.value).toHaveProperty('email');
    expect(response.value).toHaveProperty('identity_provider');
    expect(response.value).toHaveProperty('identity_provider_id');
    expect.objectContaining(response);
  });

  it('should not updated a User', async () => {
    const mockUser: InputUpdateUserDto = {
      id: '123-321',
      data: {
        email: 'newEmail@email.com',
        name: 'new name',
      },
    };
    jest
      .spyOn(userRepository, 'update')
      .mockResolvedValue(left(userUpdateError));
    const response = await updateUserUseCase.execute(mockUser);
    expect(response).toBeDefined();
    expect(response.isLeft()).toBeTruthy();
    expect(response).toBeInstanceOf(Left);
    expect(response.value).toHaveProperty('httpCode');
    expect(response.value).toHaveProperty('code');
    expect.objectContaining(response);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Left, Right, left, right } from '@shared/either';
import {
  IUserRepository,
  IUserRepositoryToken,
} from '@business/repositories/userRepository';
import { UpdateUserUseCase, InputUpdateUserDto } from './updateUserUseCase';
import { UserEntity } from '@domain/entities/user';
import { userUpdateError } from '@business/errors/user';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const userRepositoryMock = {
      findBy: jest.fn(),
      update: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: IUserRepositoryToken, useValue: userRepositoryMock },
      ],
    }).compile();

    updateUserUseCase = moduleRef.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = moduleRef.get(IUserRepositoryToken);
  });

  it('should be defined', () => {
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

    userRepository.findBy.mockResolvedValue(right(mockUpdatedUser));
    userRepository.update.mockResolvedValue(right(mockUpdatedUser));

    const response = await updateUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isRight()).toBe(true);
    expect(response).toBeInstanceOf(Right);
    expect(response.value).toHaveProperty('id');
    expect(response.value).toHaveProperty('name');
    expect(response.value).toHaveProperty('email');
  });

  it('should not update a User and return error', async () => {
    const mockUser: InputUpdateUserDto = {
      id: '123-321',
      data: {
        email: 'newEmail@email.com',
        name: 'new name',
      },
    };

    userRepository.findBy.mockResolvedValue(
      right({
        id: '123-321',
        name: 'old name',
        is_master: false,
        email: 'oldEmail@email.com',
        password: '123',
        identity_provider: null,
        identity_provider_id: null,
      }),
    );

    userRepository.update.mockResolvedValue(left(userUpdateError));

    const response = await updateUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isLeft()).toBe(true);
    expect(response).toBeInstanceOf(Left);
    expect(response.value).toHaveProperty('httpCode');
    expect(response.value).toHaveProperty('code');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Either, Left, Right, left, right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputCreateEssayRepositoryDto,
} from '@business/repositories/essayRepository';
import { CreateEssayUseCase, InputCreateEssayDto } from './createEssayUseCase';
import { EssayEntity, EssayStatusType } from '@domain/entities/essay';
import { IError } from '@shared/error';
import { disableExternalServices } from '@utils/test';

describe('CreateEssayUseCase', () => {
  let createEssayUseCase: CreateEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          CreateEssayUseCase,
          {
            provide: IEssayRepositoryToken,
            useValue: {
              create: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    createEssayUseCase = moduleRef.get<CreateEssayUseCase>(CreateEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(createEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return created Essay on success', async () => {
    const input: InputCreateEssayDto = {
      title: 'Test Title',
      text: 'Test essay text',
      theme: 'Education',
      status: EssayStatusType.Reviewed,
      user_id: 'user-123',
      note: null,
      created_at: new Date(),
    };

    const mockEssay: EssayEntity = {
      id: 'essay-123',
      ...input,
      user: {
        id: 'user-123',
        name: 'User Name',
        email: 'user@example.com',
        is_master: false,
        password: 'hashed-password',
      },
      updated_at: null,
      deleted_at: null,
    };

    essayRepository.create.mockResolvedValue(right(mockEssay));

    const result = await createEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveProperty('id', 'essay-123');
    expect(result.value).toHaveProperty('title', input.title);
    expect(result.value).toHaveProperty('user');
    expect(result.value['user']).toHaveProperty('id', input.user_id);
  });

  it('should return error on failure', async () => {
    const input: InputCreateEssayDto = {
      title: 'Test Title',
      text: 'Test essay text',
      theme: 'Education',
      status: EssayStatusType.Reviewed,
      user_id: 'user-123',
      note: null,
    };

    const mockError: IError = {
      httpCode: 400,
      code: 'ERR_CREATE_ESSAY',
      message: 'Failed to create essay',
      shortMessage: 'Create essay error',
    };

    essayRepository.create.mockResolvedValue(left(mockError));

    const result = await createEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('httpCode', 400);
    expect(result.value).toHaveProperty('code', 'ERR_CREATE_ESSAY');
    expect(result.value).toHaveProperty('message', 'Failed to create essay');
  });
});

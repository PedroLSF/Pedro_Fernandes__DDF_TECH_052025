import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';

import {
  GetEssayUseCase,
  InputGetEssayDto,
  OutputGetEssayDto,
} from './getEssayUseCase';
import { EssayStatusType, IEssay } from '@domain/entities/essay';

describe('GetEssayUseCase', () => {
  let getEssayUseCase: GetEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      findBy: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetEssayUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    getEssayUseCase = moduleRef.get<GetEssayUseCase>(GetEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(getEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return essay on success', async () => {
    const input: InputGetEssayDto = {
      by: 'id',
      value: 'essay-123',
    };

    const mockEssay: IEssay = {
      id: 'essay-123',
      title: 'Sample Essay',
      text: 'Essay text here',
      theme: 'Education',
      note: 80,
      status: EssayStatusType.Reviewed,
      user_id: 'user-123',
      user: {
        id: 'user-123',
        name: 'User Name',
        email: 'user@example.com',
        is_master: false,
        password: 'hashed-password',
      },
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };

    essayRepository.findBy.mockResolvedValue(right(mockEssay));

    const result = await getEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveProperty('id', 'essay-123');
    expect(result.value).toHaveProperty('title', 'Sample Essay');
    expect(result.value).toHaveProperty('user_id', 'user-123');
  });

  it('should return error on failure', async () => {
    const input: InputGetEssayDto = {
      by: 'id',
      value: 'essay-404',
    };

    const mockError: IError = {
      httpCode: 404,
      code: 'ERR_GET_ESSAY',
      message: 'Essay not found',
      shortMessage: 'Essay not found',
    };

    essayRepository.findBy.mockResolvedValue(left(mockError));

    const result = await getEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_GET_ESSAY');
  });
});

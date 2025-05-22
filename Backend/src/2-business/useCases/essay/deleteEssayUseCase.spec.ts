import { Test, TestingModule } from '@nestjs/testing';
import { Either, Left, Right, left, right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { DeleteEssayUseCase, InputDeleteEssayDto } from './deleteEssayUseCase';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';

describe('DeleteEssayUseCase', () => {
  let deleteEssayUseCase: DeleteEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          DeleteEssayUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    deleteEssayUseCase = moduleRef.get<DeleteEssayUseCase>(DeleteEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(deleteEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return true on successful delete', async () => {
    const input: InputDeleteEssayDto = { id: 'essay-123' };
    essayRepository.delete.mockResolvedValue(right(true));

    const result = await deleteEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toBe(true);
    expect(essayRepository.delete).toHaveBeenCalledWith({ id: input.id });
  });

  it('should return error on failure', async () => {
    const input: InputDeleteEssayDto = { id: 'essay-123' };
    const mockError: IError = {
      httpCode: 404,
      code: 'ERR_DELETE_ESSAY',
      message: 'Essay not found',
      shortMessage: 'Delete error',
    };

    essayRepository.delete.mockResolvedValue(left(mockError));

    const result = await deleteEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_DELETE_ESSAY');
    expect(essayRepository.delete).toHaveBeenCalledWith({ id: input.id });
  });
});

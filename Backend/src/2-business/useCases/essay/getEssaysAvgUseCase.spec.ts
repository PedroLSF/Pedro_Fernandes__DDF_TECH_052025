import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { GetEssaysAvgUseCase, InputEssayAvgDto } from './getEssaysAvgUseCase';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';
import { EssayAvgItem } from '@domain/entities/essay';

describe('GetEssaysAvgUseCase', () => {
  let getEssaysAvgUseCase: GetEssaysAvgUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      getEssaysAvgNote: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetEssaysAvgUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    getEssaysAvgUseCase =
      moduleRef.get<GetEssaysAvgUseCase>(GetEssaysAvgUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(getEssaysAvgUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return average note array on success', async () => {
    const input: InputEssayAvgDto = {
      userId: 'user-123',
    };

    const mockOutputData: EssayAvgItem[] = [
      { month: '2023-01', avg: 4.2 },
      { month: '2023-02', avg: 4.5 },
      { month: '2023-03', avg: 4.7 },
    ];

    essayRepository.getEssaysAvgNote.mockResolvedValue(right(mockOutputData));

    const result = await getEssaysAvgUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveLength(3);
    expect(result.value[0]).toEqual({ month: '2023-01', avg: 4.2 });
    expect(result.value[1]).toEqual({ month: '2023-02', avg: 4.5 });
    expect(result.value[2]).toEqual({ month: '2023-03', avg: 4.7 });
    expect(essayRepository.getEssaysAvgNote).toHaveBeenCalledWith(input);
  });

  it('should return error on failure', async () => {
    const input: InputEssayAvgDto = {
      userId: 'user-123',
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_AVG_ESSAYS',
      message: 'Failed to get average essays note',
      shortMessage: 'Avg essays error',
    };

    essayRepository.getEssaysAvgNote.mockResolvedValue(left(mockError));

    const result = await getEssaysAvgUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_AVG_ESSAYS');
    expect(essayRepository.getEssaysAvgNote).toHaveBeenCalledWith(input);
  });
});

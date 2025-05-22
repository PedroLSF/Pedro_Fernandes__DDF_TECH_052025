import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import {
  GetEssaysPerMonthUseCase,
  InputEssayPerMonthDto,
} from './getEssaysPerMonthUseCase';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';
import { EssayPerMonthItem } from '@domain/entities/essay';

describe('GetEssaysPerMonthUseCase', () => {
  let getEssaysPerMonthUseCase: GetEssaysPerMonthUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      getEssaysPerMonth: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetEssaysPerMonthUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    getEssaysPerMonthUseCase = moduleRef.get<GetEssaysPerMonthUseCase>(
      GetEssaysPerMonthUseCase,
    );
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(getEssaysPerMonthUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return essays per month array on success', async () => {
    const input: InputEssayPerMonthDto = {
      userId: 'user-123',
    };

    const mockOutputData: EssayPerMonthItem[] = [
      { month: '2023-01', count: 5 },
      { month: '2023-02', count: 8 },
      { month: '2023-03', count: 3 },
    ];

    essayRepository.getEssaysPerMonth.mockResolvedValue(right(mockOutputData));

    const result = await getEssaysPerMonthUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveLength(3);
    expect(result.value[0]).toEqual({ month: '2023-01', count: 5 });
    expect(result.value[1]).toEqual({ month: '2023-02', count: 8 });
    expect(result.value[2]).toEqual({ month: '2023-03', count: 3 });
    expect(essayRepository.getEssaysPerMonth).toHaveBeenCalledWith(input);
  });

  it('should return error on failure', async () => {
    const input: InputEssayPerMonthDto = {
      userId: 'user-123',
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_GET_ESSAYS_PER_MONTH',
      message: 'Failed to get essays per month',
      shortMessage: 'Get essays per month error',
    };

    essayRepository.getEssaysPerMonth.mockResolvedValue(left(mockError));

    const result = await getEssaysPerMonthUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_GET_ESSAYS_PER_MONTH');
    expect(essayRepository.getEssaysPerMonth).toHaveBeenCalledWith(input);
  });
});

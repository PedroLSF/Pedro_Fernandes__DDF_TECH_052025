import { Test, TestingModule } from '@nestjs/testing';
import { disableExternalServices } from '@utils/test';
import { Either, left, right } from '@shared/either';
import {
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';
import {
  CountPlanningUseCase,
  InputCountPlanningDto,
  OutputCountPlanningDto,
} from './countPlanningUseCase';
import { IError } from '@shared/error';

describe('CountPlanningUseCase', () => {
  let countPlanningUseCase: CountPlanningUseCase;
  let planningRepository: jest.Mocked<IPlanningRepository>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          CountPlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              count: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    countPlanningUseCase =
      moduleRef.get<CountPlanningUseCase>(CountPlanningUseCase);
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should be defined', () => {
    expect(countPlanningUseCase).toBeDefined();
    expect(planningRepository).toBeDefined();
  });

  it('should return count number on success', async () => {
    const input: InputCountPlanningDto = {
      filter: { start_date: '2025-01-01', end_date: '2025-01-31' },
    };
    planningRepository.count.mockResolvedValue(right(42));

    const result = await countPlanningUseCase.execute(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(42);
    expect(planningRepository.count).toHaveBeenCalledWith(input);
  });

  it('should return error on failure', async () => {
    const input: InputCountPlanningDto = { filter: {} };
    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_COUNT_PLANNING',
      message: 'Error counting planning items',
      shortMessage: 'Count error',
    };
    planningRepository.count.mockResolvedValue(left(mockError));

    const result = await countPlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toHaveProperty('code', 'ERR_COUNT_PLANNING');
    expect(planningRepository.count).toHaveBeenCalledWith(input);
  });
});

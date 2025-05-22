import { Test, TestingModule } from '@nestjs/testing';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { left, right } from '@shared/either';
import { disableExternalServices } from '@utils/test';
import { GetPlanningsPerMonthUseCase } from './getPlanningsPerMonthUseCase';

describe('GetPlanningsPerMonthUseCase', () => {
  let getPlanningsPerMonthUseCase: GetPlanningsPerMonthUseCase;
  let planningRepository: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetPlanningsPerMonthUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              getPlanningsPerMonth: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    getPlanningsPerMonthUseCase = moduleRef.get<GetPlanningsPerMonthUseCase>(
      GetPlanningsPerMonthUseCase,
    );
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should return planning counts per month successfully', async () => {
    const fakeData = [
      { month: '2023-01', count: 5 },
      { month: '2023-02', count: 3 },
    ];
    planningRepository.getPlanningsPerMonth.mockResolvedValueOnce(
      right(fakeData),
    );

    const input = { userId: 'user-123' };
    const result = await getPlanningsPerMonthUseCase.execute(input);

    expect(planningRepository.getPlanningsPerMonth).toHaveBeenCalledWith(input);
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(fakeData);
  });

  it('should return error when repository returns left', async () => {
    const error = { message: 'Something went wrong' };
    planningRepository.getPlanningsPerMonth.mockResolvedValueOnce(left(error));

    const input = { userId: 'user-123' };
    const result = await getPlanningsPerMonthUseCase.execute(input);

    expect(planningRepository.getPlanningsPerMonth).toHaveBeenCalledWith(input);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe(error);
  });
});

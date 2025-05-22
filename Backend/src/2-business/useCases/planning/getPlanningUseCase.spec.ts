import { Test, TestingModule } from '@nestjs/testing';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { left, right } from '@shared/either';
import { GetPlanningUseCase, InputGetPlanningDto } from './getPlanningUseCase';
import { disableExternalServices } from '@utils/test';

describe('GetPlanningUseCase', () => {
  let getPlanningUseCase: GetPlanningUseCase;
  let planningRepository: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetPlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              findBy: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    getPlanningUseCase = moduleRef.get<GetPlanningUseCase>(GetPlanningUseCase);
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should return planning when found', async () => {
    const fakePlanning = {
      id: 'planning-1',
      title: 'Test Planning',
      theme: 'Theme X',
      text: 'Some text',
      user_id: 'user-123',
      user: {
        /* mock IUser */
      },
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };

    planningRepository.findBy.mockResolvedValueOnce(right(fakePlanning));

    const input: InputGetPlanningDto = { by: 'id', value: 'planning-1' };
    const result = await getPlanningUseCase.execute(input);

    expect(planningRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: 'planning-1',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(fakePlanning);
  });

  it('should return error when planning not found', async () => {
    const error = { message: 'Planning not found' };
    planningRepository.findBy.mockResolvedValueOnce(left(error));

    const input: InputGetPlanningDto = { by: 'id', value: 'planning-unknown' };
    const result = await getPlanningUseCase.execute(input);

    expect(planningRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: 'planning-unknown',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe(error);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { DeletePlanningUseCase } from './deletePlanningUseCase';
import { disableExternalServices } from '@utils/test';
import { left, right } from '@shared/either';

describe('DeletePlanningUseCase', () => {
  let deletePlanningUseCase: DeletePlanningUseCase;
  let planningRepository: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          DeletePlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              delete: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    deletePlanningUseCase = moduleRef.get<DeletePlanningUseCase>(
      DeletePlanningUseCase,
    );
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should delete planning successfully', async () => {
    planningRepository.delete.mockResolvedValueOnce(right(true));

    const input = { id: 'planning-id-123' };
    const result = await deletePlanningUseCase.execute(input);

    expect(planningRepository.delete).toHaveBeenCalledWith({ id: input.id });
    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(true);
  });

  it('should return error if delete fails', async () => {
    const error = { message: 'Delete failed' };
    planningRepository.delete.mockResolvedValueOnce(left(error));

    const input = { id: 'planning-id-123' };
    const result = await deletePlanningUseCase.execute(input);

    expect(planningRepository.delete).toHaveBeenCalledWith({ id: input.id });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBe(error);
  });
});

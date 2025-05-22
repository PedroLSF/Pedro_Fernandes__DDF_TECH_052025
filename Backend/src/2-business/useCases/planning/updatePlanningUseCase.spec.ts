import { Test, TestingModule } from '@nestjs/testing';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { Either, left, right } from '@shared/either';
import { PlanningEntity } from '@domain/entities/planning';
import { disableExternalServices } from '@utils/test';
import { UpdatePlanningUseCase } from './updatePlanningUseCase';

describe('UpdatePlanningUseCase', () => {
  let updatePlanningUseCase: UpdatePlanningUseCase;
  let planningRepository: {
    findBy: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          UpdatePlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              findBy: jest.fn(),
              update: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    updatePlanningUseCase = moduleRef.get(UpdatePlanningUseCase);
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should update planning successfully', async () => {
    const input = {
      id: '123',
      data: { title: 'Updated Title' },
    };

    const foundPlanning = new PlanningEntity();
    foundPlanning.id = '123';
    foundPlanning.title = 'Old Title';
    foundPlanning.theme = 'Theme';
    foundPlanning.text = 'Text';
    foundPlanning.user_id = 'user1';
    foundPlanning.created_at = new Date();

    const updatedPlanning = { ...foundPlanning, ...input.data };

    planningRepository.findBy.mockResolvedValueOnce(right(foundPlanning));
    planningRepository.update.mockResolvedValueOnce(right(updatedPlanning));

    const result = await updatePlanningUseCase.execute(input);

    expect(planningRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: input.id,
    });
    expect(planningRepository.update).toHaveBeenCalledWith({
      id: input.id,
      data: input.data,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.title).toBe('Updated Title');
    }
  });

  it('should return left if planning not found', async () => {
    const input = { id: '123', data: { title: 'Updated Title' } };
    const error = new Error('Not found');

    planningRepository.findBy.mockResolvedValueOnce(left(error));

    const result = await updatePlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBe(error);
    }
  });

  it('should return left if update fails', async () => {
    const input = { id: '123', data: { title: 'Updated Title' } };
    const foundPlanning = new PlanningEntity();
    foundPlanning.id = '123';
    foundPlanning.title = 'Old Title';
    foundPlanning.theme = 'Theme';
    foundPlanning.text = 'Text';
    foundPlanning.user_id = 'user1';
    foundPlanning.created_at = new Date();

    const error = new Error('Update failed');

    planningRepository.findBy.mockResolvedValueOnce(right(foundPlanning));
    planningRepository.update.mockResolvedValueOnce(left(error));

    const result = await updatePlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBe(error);
    }
  });
});

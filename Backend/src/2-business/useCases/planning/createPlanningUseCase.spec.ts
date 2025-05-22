import { Test, TestingModule } from '@nestjs/testing';
import { disableExternalServices } from '@utils/test';
import { Either, left, right } from '@shared/either';
import {
  IPlanningRepository,
  IPlanningRepositoryToken,
} from '@business/repositories/planningRepository';
import {
  CreatePlanningUseCase,
  InputCreatePlanningDto,
  OutputCreatePlanningDto,
} from './createPlanningUseCase';
import { IError } from '@shared/error';
import { PlanningEntity } from '@domain/entities/planning';

describe('CreatePlanningUseCase', () => {
  let createPlanningUseCase: CreatePlanningUseCase;
  let planningRepository: jest.Mocked<IPlanningRepository>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          CreatePlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              create: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    createPlanningUseCase = moduleRef.get<CreatePlanningUseCase>(
      CreatePlanningUseCase,
    );
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should be defined', () => {
    expect(createPlanningUseCase).toBeDefined();
    expect(planningRepository).toBeDefined();
  });

  it('should create and return a PlanningEntity on success', async () => {
    const input: InputCreatePlanningDto = {
      title: 'Planejamento Maio',
      theme: 'Temática X',
      text: 'Texto descritivo do planejamento',
      user_id: 'user-uuid-123',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };
    const planningEntity = new PlanningEntity();
    planningRepository.create.mockResolvedValue(right(planningEntity));

    const result = await createPlanningUseCase.execute(input);

    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(planningEntity);
    expect(planningRepository.create).toHaveBeenCalledWith(input);
  });

  it('should return an error on failure', async () => {
    const input: InputCreatePlanningDto = {
      title: 'Planejamento Maio',
      theme: 'Temática X',
      text: 'Texto descritivo do planejamento',
      user_id: 'user-uuid-123',
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };
    const mockError: IError = {
      httpCode: 400,
      code: 'ERR_CREATE_PLANNING',
      message: 'Failed to create planning',
      shortMessage: 'Create error',
    };
    planningRepository.create.mockResolvedValue(left(mockError));

    const result = await createPlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toHaveProperty('code', 'ERR_CREATE_PLANNING');
    expect(planningRepository.create).toHaveBeenCalledWith(input);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { disableExternalServices } from '@utils/test';
import { ListPlanningUseCase } from './listPlanningUseCase';
import { left, right } from '@shared/either';

describe('ListPlanningUseCase', () => {
  let listPlanningUseCase: ListPlanningUseCase;
  let planningRepository: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          ListPlanningUseCase,
          {
            provide: IPlanningRepositoryToken,
            useValue: {
              count: jest.fn(),
              list: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    listPlanningUseCase =
      moduleRef.get<ListPlanningUseCase>(ListPlanningUseCase);
    planningRepository = moduleRef.get(IPlanningRepositoryToken);
  });

  it('should return paginated plannings on success', async () => {
    const input = { take: 10, skip: 0, filter: {}, order: {} };

    // Mockando o retorno do count e do list
    planningRepository.count.mockResolvedValueOnce(right(2));
    planningRepository.list.mockResolvedValueOnce(
      right([
        {
          id: '1',
          title: 'Planning 1',
          theme: 'Theme 1',
          text: 'Text 1',
          user_id: 'user1',
          user: { id: 'user1', name: 'User One' },
          created_at: new Date(),
          updated_at: null,
          deleted_at: null,
        },
        {
          id: '2',
          title: 'Planning 2',
          theme: 'Theme 2',
          text: 'Text 2',
          user_id: 'user2',
          user: { id: 'user2', name: 'User Two' },
          created_at: new Date(),
          updated_at: null,
          deleted_at: null,
        },
      ]),
    );

    const result = await listPlanningUseCase.execute(input);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.total).toBe(2);
      expect(result.value.results).toHaveLength(2);
      expect(result.value.skip).toBe(0);
      expect(result.value.take).toBe(10);
    }
  });

  it('should return left if count returns an error', async () => {
    const input = { take: 10, skip: 0, filter: {}, order: {} };

    planningRepository.count.mockResolvedValueOnce(
      left(new Error('Count error')),
    );

    const result = await listPlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toBe('Count error');
    }
  });

  it('should return left if list returns an error', async () => {
    const input = { take: 10, skip: 0, filter: {}, order: {} };

    planningRepository.count.mockResolvedValueOnce(right(0));
    planningRepository.list.mockResolvedValueOnce(
      left(new Error('List error')),
    );

    const result = await listPlanningUseCase.execute(input);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toBe('List error');
    }
  });
});

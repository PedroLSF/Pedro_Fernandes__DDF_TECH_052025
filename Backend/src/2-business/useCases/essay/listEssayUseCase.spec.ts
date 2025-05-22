import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import { Paginated } from '@shared/pagination';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';

import {
  ListEssayUseCase,
  InputListEssayDto,
  OutputListEssayDto,
} from './listEssayUseCase';
import { EssayStatusType, IEssay } from '@domain/entities/essay';

describe('ListEssayUseCase', () => {
  let listEssayUseCase: ListEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      count: jest.fn(),
      list: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          ListEssayUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    listEssayUseCase = moduleRef.get<ListEssayUseCase>(ListEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(listEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return paginated essays on success', async () => {
    const input: InputListEssayDto = {
      skip: 0,
      take: 10,
    };

    const mockEssays: IEssay[] = [
      {
        id: 'essay-1',
        title: 'Title 1',
        text: 'Text 1',
        theme: 'Education',
        note: 9,
        status: EssayStatusType.Reviewed,
        user_id: 'user-1',
        user: {
          id: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          is_master: false,
          password: 'hashed',
        },
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
      {
        id: 'essay-2',
        title: 'Title 2',
        text: 'Text 2',
        theme: 'Science',
        note: 7,
        status: EssayStatusType.Reviewed,
        user_id: 'user-2',
        user: {
          id: 'user-2',
          name: 'User Two',
          email: 'user2@example.com',
          is_master: false,
          password: 'hashed',
        },
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      },
    ];

    essayRepository.count.mockResolvedValue(right(2));
    essayRepository.list.mockResolvedValue(right(mockEssays));

    const result = await listEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);

    if (result.isRight()) {
      const paginated = result.value as Paginated<
        Omit<IEssay, 'top_secret_prop'>
      >;
      expect(paginated.total).toBe(2);
      expect(paginated.results).toHaveLength(2);
      expect(paginated.results[0]).toHaveProperty('id', 'essay-1');
      expect(paginated.results[1]).toHaveProperty('id', 'essay-2');
      expect(paginated.skip).toBe(input.skip);
      expect(paginated.take).toBe(input.take);
    }
  });

  it('should return error if count fails', async () => {
    const input: InputListEssayDto = {
      skip: 0,
      take: 10,
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_COUNT_ESSAYS',
      message: 'Count essays failed',
      shortMessage: 'Count error',
    };

    essayRepository.count.mockResolvedValue(left(mockError));
    essayRepository.list.mockResolvedValue(right([]));

    const result = await listEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_COUNT_ESSAYS');
  });

  it('should return error if list fails', async () => {
    const input: InputListEssayDto = {
      skip: 0,
      take: 10,
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_LIST_ESSAYS',
      message: 'List essays failed',
      shortMessage: 'List error',
    };

    essayRepository.count.mockResolvedValue(right(5));
    essayRepository.list.mockResolvedValue(left(mockError));

    const result = await listEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_LIST_ESSAYS');
  });
});

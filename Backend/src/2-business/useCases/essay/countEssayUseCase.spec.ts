import { Test, TestingModule } from '@nestjs/testing';
import { Either, Left, Right, left, right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { CountEssayUseCase, InputCountEssayDto } from './countEssayUseCase';
import { IError } from '@shared/error';
import { disableExternalServices } from '@utils/test';

describe('CountEssayUseCase', () => {
  let countEssayUseCase: CountEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          CountEssayUseCase,
          {
            provide: IEssayRepositoryToken,
            useValue: {
              count: jest.fn(),
            },
          },
        ],
      }),
    ).compile();

    countEssayUseCase = moduleRef.get<CountEssayUseCase>(CountEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(countEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return count number on success', async () => {
    const input: InputCountEssayDto = {
      filter: {
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-12-31'),
      },
    };

    const mockCount = 42;

    essayRepository.count.mockResolvedValue(right(mockCount));

    const result = await countEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toBe(mockCount);
  });

  it('should return error on failure', async () => {
    const input: InputCountEssayDto = {
      filter: {},
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_COUNT_ESSAY',
      message: 'Failed to count essays',
      shortMessage: 'mockError',
    };

    essayRepository.count.mockResolvedValue(left(mockError));

    const result = await countEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('httpCode', 500);
    expect(result.value).toHaveProperty('code', 'ERR_COUNT_ESSAY');
    expect(result.value).toHaveProperty('message', 'Failed to count essays');
    expect(result.value).toHaveProperty('shortMessage', 'mockError');
  });
});

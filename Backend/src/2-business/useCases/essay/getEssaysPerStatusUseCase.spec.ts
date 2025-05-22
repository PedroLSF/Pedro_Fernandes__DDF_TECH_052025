import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import {
  GetEssaysPerStatusUseCase,
  InputEssayPerStatusDto,
} from './getEssaysPerStatusUseCase';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';
import { EssayPerStatusItem } from '@domain/entities/essay';
import { EssayStatusType } from '@prisma/client';

describe('GetEssaysPerStatusUseCase', () => {
  let getEssaysPerStatusUseCase: GetEssaysPerStatusUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      getEssaysPerStatus: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetEssaysPerStatusUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    getEssaysPerStatusUseCase = moduleRef.get<GetEssaysPerStatusUseCase>(
      GetEssaysPerStatusUseCase,
    );
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(getEssaysPerStatusUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return essays per status array on success', async () => {
    const input: InputEssayPerStatusDto = {
      userId: 'user-123',
    };

    const mockOutputData: EssayPerStatusItem[] = [
      { status: EssayStatusType.Reviewed, count: 10 },
      { status: EssayStatusType.Reviewed, count: 5 },
      { status: EssayStatusType.Reviewed, count: 2 },
    ];

    essayRepository.getEssaysPerStatus.mockResolvedValue(right(mockOutputData));

    const result = await getEssaysPerStatusUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveLength(3);
    expect(result.value[0]).toEqual({
      status: EssayStatusType.Reviewed,
      count: 10,
    });
    expect(result.value[1]).toEqual({
      status: EssayStatusType.Reviewed,
      count: 5,
    });
    expect(result.value[2]).toEqual({
      status: EssayStatusType.Reviewed,
      count: 2,
    });
    expect(essayRepository.getEssaysPerStatus).toHaveBeenCalledWith(input);
  });

  it('should return error on failure', async () => {
    const input: InputEssayPerStatusDto = {
      userId: 'user-123',
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_GET_ESSAYS_PER_STATUS',
      message: 'Failed to get essays per status',
      shortMessage: 'Get essays per status error',
    };

    essayRepository.getEssaysPerStatus.mockResolvedValue(left(mockError));

    const result = await getEssaysPerStatusUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_GET_ESSAYS_PER_STATUS');
    expect(essayRepository.getEssaysPerStatus).toHaveBeenCalledWith(input);
  });
});

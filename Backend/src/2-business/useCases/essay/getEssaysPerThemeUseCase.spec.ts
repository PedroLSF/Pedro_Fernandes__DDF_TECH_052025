import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
  InputEssayPerThemeRepositoryDto,
} from '@business/repositories/essayRepository';
import { IError } from '@shared/error';

import { disableExternalServices } from '@utils/test';

import { GetEssaysPerThemeUseCase } from './getEssaysPerThemeUseCase';
import { EssayPerThemeItem } from '@domain/entities/essay';

describe('GetEssaysPerThemeUseCase', () => {
  let getEssaysPerThemeUseCase: GetEssaysPerThemeUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      getEssaysPerTheme: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          GetEssaysPerThemeUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    getEssaysPerThemeUseCase = moduleRef.get<GetEssaysPerThemeUseCase>(
      GetEssaysPerThemeUseCase,
    );
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(getEssaysPerThemeUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should return essays per theme array on success', async () => {
    const input: InputEssayPerThemeRepositoryDto = {
      userId: 'user-123',
    };

    const mockOutputData: EssayPerThemeItem[] = [
      { theme: 'Education', count: 15 },
      { theme: 'Technology', count: 7 },
      { theme: 'Health', count: 3 },
    ];

    essayRepository.getEssaysPerTheme.mockResolvedValue(right(mockOutputData));

    const result = await getEssaysPerThemeUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toHaveLength(3);
    expect(result.value[0]).toEqual({ theme: 'Education', count: 15 });
    expect(result.value[1]).toEqual({ theme: 'Technology', count: 7 });
    expect(result.value[2]).toEqual({ theme: 'Health', count: 3 });
    expect(essayRepository.getEssaysPerTheme).toHaveBeenCalledWith(input);
  });

  it('should return error on failure', async () => {
    const input: InputEssayPerThemeRepositoryDto = {
      userId: 'user-123',
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_GET_ESSAYS_PER_THEME',
      message: 'Failed to get essays per theme',
      shortMessage: 'Get essays per theme error',
    };

    essayRepository.getEssaysPerTheme.mockResolvedValue(left(mockError));

    const result = await getEssaysPerThemeUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_GET_ESSAYS_PER_THEME');
    expect(essayRepository.getEssaysPerTheme).toHaveBeenCalledWith(input);
  });
});

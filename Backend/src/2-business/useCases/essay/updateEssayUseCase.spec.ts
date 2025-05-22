import { Test, TestingModule } from '@nestjs/testing';
import { left, right, Left, Right } from '@shared/either';
import {
  IEssayRepository,
  IEssayRepositoryToken,
} from '@business/repositories/essayRepository';
import { IError } from '@shared/error';
import { EssayEntity, EssayStatusType, IEssay } from '@domain/entities/essay';

import { disableExternalServices } from '@utils/test';

import {
  UpdateEssayUseCase,
  InputUpdateEssayDto,
  OutputUpdateEssayDto,
} from './updateEssayUseCase';

describe('UpdateEssayUseCase', () => {
  let updateEssayUseCase: UpdateEssayUseCase;
  let essayRepository: jest.Mocked<IEssayRepository>;

  beforeEach(async () => {
    const essayRepositoryMock = {
      findBy: jest.fn(),
      update: jest.fn(),
    };

    const moduleRef: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        providers: [
          UpdateEssayUseCase,
          { provide: IEssayRepositoryToken, useValue: essayRepositoryMock },
        ],
      }),
    ).compile();

    updateEssayUseCase = moduleRef.get<UpdateEssayUseCase>(UpdateEssayUseCase);
    essayRepository = moduleRef.get(IEssayRepositoryToken);
  });

  it('should be defined', () => {
    expect(updateEssayUseCase).toBeDefined();
    expect(essayRepository).toBeDefined();
  });

  it('should update essay successfully', async () => {
    const input: InputUpdateEssayDto = {
      id: 'essay-123',
      data: { title: 'Updated Title', note: 8 },
    };

    const foundEssay: IEssay = {
      id: 'essay-123',
      title: 'Old Title',
      text: 'Some text',
      theme: 'Theme',
      note: 7,
      status: EssayStatusType.Reviewed,
      user_id: 'user-1',
      user: {
        id: 'user-1',
        name: 'User',
        email: 'user@example.com',
        is_master: false,
        password: 'hashed',
      },
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };

    const updatedEssay: EssayEntity = {
      id: 'essay-123',
      title: 'Título',
      text: 'Texto',
      theme: 'Educação',
      note: null,
      status: EssayStatusType.Reviewed,
      user_id: 'user-123',
      user: {
        id: 'user-123',
        name: 'Usuário Teste',
        email: 'teste@email.com',
        is_master: false,
        password: 'hashed-password',
      },
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };

    essayRepository.findBy.mockResolvedValue(right(foundEssay));
    essayRepository.update.mockResolvedValue(right(updatedEssay));

    const result = await updateEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(result).toBeInstanceOf(Right);
    expect(result.value).toMatchObject({
      id: input.id,
      title: 'Título',
      note: null,
    });
    expect(essayRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: input.id,
    });
    expect(essayRepository.update).toHaveBeenCalledWith({
      id: input.id,
      data: input.data,
    });
  });

  it('should return error if essay not found', async () => {
    const input: InputUpdateEssayDto = {
      id: 'essay-123',
      data: { title: 'Updated Title' },
    };

    const mockError: IError = {
      httpCode: 404,
      code: 'ERR_ESSAY_NOT_FOUND',
      message: 'Essay not found',
      shortMessage: 'Not found',
    };

    essayRepository.findBy.mockResolvedValue(left(mockError));

    const result = await updateEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_ESSAY_NOT_FOUND');
    expect(essayRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: input.id,
    });
    expect(essayRepository.update).not.toHaveBeenCalled();
  });

  it('should return error if update fails', async () => {
    const input: InputUpdateEssayDto = {
      id: 'essay-123',
      data: { note: 10 },
    };

    const foundEssay: IEssay = {
      id: 'essay-123',
      title: 'Old Title',
      text: 'Some text',
      theme: 'Theme',
      note: 7,
      status: EssayStatusType.Reviewed,
      user_id: 'user-1',
      user: {
        id: 'user-1',
        name: 'User',
        email: 'user@example.com',
        is_master: false,
        password: 'hashed',
      },
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
    };

    const mockError: IError = {
      httpCode: 500,
      code: 'ERR_UPDATE_ESSAY',
      message: 'Update failed',
      shortMessage: 'Update error',
    };

    essayRepository.findBy.mockResolvedValue(right(foundEssay));
    essayRepository.update.mockResolvedValue(left(mockError));

    const result = await updateEssayUseCase.execute(input);

    expect(result).toBeDefined();
    expect(result.isLeft()).toBe(true);
    expect(result).toBeInstanceOf(Left);
    expect(result.value).toHaveProperty('code', 'ERR_UPDATE_ESSAY');
    expect(essayRepository.findBy).toHaveBeenCalledWith({
      type: 'id',
      value: input.id,
    });
    expect(essayRepository.update).toHaveBeenCalledWith({
      id: input.id,
      data: input.data,
    });
  });
});

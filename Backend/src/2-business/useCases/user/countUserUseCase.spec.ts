import { Test, TestingModule } from '@nestjs/testing';
import { CountUserUseCase } from './countUserUseCase';
import { disableExternalServices } from '@utils/test';
import { AppModule } from '../../../app.module';
import { Left, Right, left, right } from '@shared/either';
import { userCountError } from '@business/errors/user';

describe('countUserUseCase', () => {
  let countUserUseCase: CountUserUseCase;

  beforeEach(async () => {
    const app: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        imports: [AppModule],
      }),
    ).compile();

    countUserUseCase = app.get<CountUserUseCase>(CountUserUseCase);
  });

  it('should be defined', async () => {
    process.env['OMIT_ERROR_LOGGING_ONCE'] = 'once';
    process.env['NODE_ENV'] = 'testing';
    expect(countUserUseCase).toBeDefined();
  });

  it('should count a User', async () => {
    process.env['OMIT_ERROR_LOGGING_ONCE'] = 'once';
    process.env['NODE_ENV'] = 'testing';
    jest.spyOn(countUserUseCase, 'execute').mockResolvedValue(right(3));
    const response = await countUserUseCase.execute({});

    expect(response).toBeDefined();
    expect(response.isRight()).toBeTruthy();
    expect(response).toBeInstanceOf(Right);
    expect(response.value).toEqual(3);
    expect.objectContaining(response);
  });

  it('should not count a User', async () => {
    process.env['OMIT_ERROR_LOGGING_ONCE'] = 'once';
    process.env['NODE_ENV'] = 'testing';
    jest
      .spyOn(countUserUseCase, 'execute')
      .mockResolvedValue(left(userCountError));
    const response = await countUserUseCase.execute({});

    expect(response).toBeDefined();
    expect(response.isLeft()).toBeTruthy();
    expect(response).toBeInstanceOf(Left);
    expect(response.value).toHaveProperty('httpCode');
    expect(response.value).toHaveProperty('code');
    expect(response.value).toHaveProperty('shortMessage');
    expect(response.value).toHaveProperty('message');
    expect.objectContaining(response);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { disableExternalServices } from '@utils/test';
import { AppModule } from '../../../app.module';
import { Left, Right, left, right } from '@shared/either';
import { DeleteUserUseCase, InputDeleteUserDto } from './deleteUserUseCase';
import { userDeleteError } from '@business/errors/user';

describe('deleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;

  beforeEach(async () => {
    const app: TestingModule = await disableExternalServices(
      Test.createTestingModule({
        imports: [AppModule],
      }),
    ).compile();
    deleteUserUseCase = app.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  it('should be defined', async () => {
    expect(deleteUserUseCase).toBeDefined();
  });

  it('should delete a user and return true', async () => {
    process.env['OMIT_ERROR_LOGGING_ONCE'] = 'once';
    process.env['NODE_ENV'] = 'testing';
    const mockUser: InputDeleteUserDto = { id: '123' };

    jest.spyOn(deleteUserUseCase, 'execute').mockResolvedValue(right(true));

    const response = await deleteUserUseCase.execute(mockUser);

    expect(response).toBeDefined();
    expect(response.isRight()).toBeTruthy();
    expect(response).toBeInstanceOf(Right);
    expect.objectContaining(response);
  });

  it('should not delete a user and return a error', async () => {
    process.env['OMIT_ERROR_LOGGING_ONCE'] = 'once';
    process.env['NODE_ENV'] = 'testing';
    const mockUser: InputDeleteUserDto = {
      id: '123',
    };
    jest
      .spyOn(deleteUserUseCase, 'execute')
      .mockResolvedValue(left(userDeleteError));
    const response = await deleteUserUseCase.execute(mockUser);

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

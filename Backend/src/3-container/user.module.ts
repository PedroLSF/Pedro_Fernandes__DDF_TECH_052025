import { Module } from '@nestjs/common';
import { IUserRepositoryToken } from '@business/repositories/userRepository';
import { UserRepository } from '@framework/repositories/userRepository';
import { GetUserUseCase } from '@business/useCases/user/getUserUseCase';
import { DeleteUserUseCase } from '@business/useCases/user/deleteUserUseCase';
import { UpdateUserUseCase } from '@business/useCases/user/updateUserUseCase';
import { ListUserUseCase } from '@business/useCases/user/listUserUseCase';
import { CreateUserUseCase } from '@business/useCases/user/createUserUseCase';
import { UserController } from '@framework/controllers/user.controller';
import { CountUserUseCase } from '@business/useCases/user/countUserUseCase';

@Module({
  imports: [],
  providers: [
    {
      provide: IUserRepositoryToken,
      useClass: UserRepository,
    },
    GetUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    ListUserUseCase,
    DeleteUserUseCase,
    CountUserUseCase,
  ],
  controllers: [UserController],
  exports: [
    IUserRepositoryToken,
    GetUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    ListUserUseCase,
    DeleteUserUseCase,
    CountUserUseCase,
  ],
})
export class UserModule {}

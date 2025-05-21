import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ListUserUseCase } from '@business/useCases/user/listUserUseCase';
import { right } from '@shared/either';
import { serializePagination } from '@shared/pagination';
import { sendUseCaseHttpResponse } from '@utils/response';
import { Request, Response } from 'express';
import { GetUserUseCase } from '@business/useCases/user/getUserUseCase';
import { CreateUserUseCase } from '@business/useCases/user/createUserUseCase';
import { DeleteUserUseCase } from '@business/useCases/user/deleteUserUseCase';
import { UpdateUserUseCase } from '@business/useCases/user/updateUserUseCase';
import { InputPaginated } from '@framework/serializers/common/inputPaginated';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '@framework/serializers/user/user';
import { InputCreateUser } from '@framework/serializers/user/create';
import { InputUpdateUser } from '@framework/serializers/user/update';
import { IUser } from '@domain/entities/user';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('User')
@Controller('/user')
export class UserController {
  private readonly logger: Logger = new Logger(UserController.name, {
    timestamp: true,
  });

  constructor(
    private readonly listUserUseCase: ListUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {
    this.logger.debug('new instance');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to list users',
  })
  async list(
    @Req() req: Request,
    @Res() res: Response,
    @Query() input: InputPaginated<IUser>,
  ) {
    let users = await this.listUserUseCase.execute(input);

    if (users.isRight()) {
      users = right(serializePagination(UserEntity, users.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: users,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/:id')
  @HttpCode(200)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to get user by id',
  })
  async get(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    let user = await this.getUserUseCase.execute({
      by: 'id',
      value: id,
    });

    if (user.isRight()) {
      user = right(plainToInstance(UserEntity, user.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: user,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('/')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to create user',
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputCreateUser,
  ) {
    let user = await this.createUserUseCase.execute(input);

    if (user.isRight()) {
      user = right(plainToInstance(UserEntity, user.value));
    }

    if (user.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: user,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: user,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to delete user by id',
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const user = await this.deleteUserUseCase.execute({ id });

    if (user.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: user,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: user,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to update user by id',
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputUpdateUser,
    @Param('id') id: string,
  ) {
    let user = await this.updateUserUseCase.execute({
      id,
      data: input,
    });

    if (user.isRight()) {
      user = right(plainToInstance(UserEntity, user.value));
    }

    if (user.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: user,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: user,
      loggerInstance: this.logger,
    });
  }
}

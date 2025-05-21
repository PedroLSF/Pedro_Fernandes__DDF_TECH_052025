import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { sendUseCaseHttpResponse } from '@utils/response';
import { Request, Response } from 'express';
import { InputAuth } from '@framework/serializers/auth/auth';
import { AuthenticateUserUseCase } from '@business/useCases/auth/authenticateUserUseCase';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name, {
    timestamp: true,
  });

  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {
    this.logger.debug('new instance');
  }

  @ApiBearerAuth()
  @Post('/login')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to sign in',
  })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputAuth,
  ) {
    const result = await this.authenticateUserUseCase.execute({
      username: input.email,
      password: input.password,
    });

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: result,
      loggerInstance: this.logger,
    });
  }
}

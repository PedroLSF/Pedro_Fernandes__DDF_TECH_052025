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
import { ListEssayUseCase } from '@business/useCases/essay/listEssayUseCase';
import { right } from '@shared/either';
import { serializePagination } from '@shared/pagination';
import { sendUseCaseHttpResponse } from '@utils/response';
import { Request, Response } from 'express';
import { GetEssayUseCase } from '@business/useCases/essay/getEssayUseCase';
import { CreateEssayUseCase } from '@business/useCases/essay/createEssayUseCase';
import { DeleteEssayUseCase } from '@business/useCases/essay/deleteEssayUseCase';
import { UpdateEssayUseCase } from '@business/useCases/essay/updateEssayUseCase';
import { InputPaginated } from '@framework/serializers/common/inputPaginated';
import { plainToInstance } from 'class-transformer';
import { EssayEntity } from '@framework/serializers/essay/essay';
import { InputCreateEssay } from '@framework/serializers/essay/create';
import { InputUpdateEssay } from '@framework/serializers/essay/update';
import { IEssay } from '@domain/entities/essay';
import { AuthGuard } from '@nestjs/passport';
import { GetEssaysPerMonthUseCase } from '@business/useCases/essay/getEssaysPerMonthUseCase';
import { GetEssaysPerThemeUseCase } from '@business/useCases/essay/getEssaysPerThemeUseCase';

@ApiTags('Essay')
@Controller('/essay')
export class EssayController {
  private readonly logger: Logger = new Logger(EssayController.name, {
    timestamp: true,
  });

  constructor(
    private readonly listEssayUseCase: ListEssayUseCase,
    private readonly getEssayUseCase: GetEssayUseCase,
    private readonly createEssayUseCase: CreateEssayUseCase,
    private readonly deleteEssayUseCase: DeleteEssayUseCase,
    private readonly updateEssayUseCase: UpdateEssayUseCase,
    private readonly getEssaysPerMonthUseCase: GetEssaysPerMonthUseCase,
    private readonly getEssaysPerThemeUseCase: GetEssaysPerThemeUseCase,
  ) {
    this.logger.debug('new instance');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/essay-per-month')
  @ApiOperation({
    description: 'Route to get essay per month',
  })
  async getEssayPerMonth(@Req() req: Request, @Res() res: Response) {
    const essay = await this.getEssaysPerMonthUseCase.execute();

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/essay-per-theme')
  @ApiOperation({
    description: 'Route to get essay per theme',
  })
  async getEssayPerTheme(@Req() req: Request, @Res() res: Response) {
    const essay = await this.getEssaysPerThemeUseCase.execute();

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to list essays',
  })
  async list(
    @Req() req: Request,
    @Res() res: Response,
    @Query() input: InputPaginated<IEssay>,
  ) {
    let essays = await this.listEssayUseCase.execute(input);

    if (essays.isRight()) {
      essays = right(serializePagination(EssayEntity, essays.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essays,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/:id')
  @HttpCode(200)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to get essay by id',
  })
  async get(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    let essay = await this.getEssayUseCase.execute({
      by: 'id',
      value: id,
    });

    if (essay.isRight()) {
      essay = right(plainToInstance(EssayEntity, essay.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('/')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to create essay',
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputCreateEssay,
  ) {
    let essay = await this.createEssayUseCase.execute(input);

    if (essay.isRight()) {
      essay = right(plainToInstance(EssayEntity, essay.value));
    }

    if (essay.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: essay,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to delete essay by id',
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const essay = await this.deleteEssayUseCase.execute({ id });

    if (essay.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: essay,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to update essay by id',
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputUpdateEssay,
    @Param('id') id: string,
  ) {
    let essay = await this.updateEssayUseCase.execute({
      id,
      data: input,
    });

    if (essay.isRight()) {
      essay = right(plainToInstance(EssayEntity, essay.value));
    }

    if (essay.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: essay,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: essay,
      loggerInstance: this.logger,
    });
  }
}

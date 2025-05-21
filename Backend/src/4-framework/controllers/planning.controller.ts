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
import { ListPlanningUseCase } from '@business/useCases/planning/listPlanningUseCase';
import { right } from '@shared/either';
import { serializePagination } from '@shared/pagination';
import { sendUseCaseHttpResponse } from '@utils/response';
import { Request, Response } from 'express';
import { GetPlanningUseCase } from '@business/useCases/planning/getPlanningUseCase';
import { CreatePlanningUseCase } from '@business/useCases/planning/createPlanningUseCase';
import { DeletePlanningUseCase } from '@business/useCases/planning/deletePlanningUseCase';
import { UpdatePlanningUseCase } from '@business/useCases/planning/updatePlanningUseCase';
import { InputPaginated } from '@framework/serializers/common/inputPaginated';
import { plainToInstance } from 'class-transformer';
import { PlanningEntity } from '@framework/serializers/planning/planning';
import { InputCreatePlanning } from '@framework/serializers/planning/create';
import { InputUpdatePlanning } from '@framework/serializers/planning/update';
import { IPlanning } from '@domain/entities/planning';
import { AuthGuard } from '@nestjs/passport';
import { GetPlanningsPerMonthUseCase } from '@business/useCases/planning/getPlanningsPerMonthUseCase';

@ApiTags('Planning')
@Controller('/planning')
export class PlanningController {
  private readonly logger: Logger = new Logger(PlanningController.name, {
    timestamp: true,
  });

  constructor(
    private readonly listPlanningUseCase: ListPlanningUseCase,
    private readonly getPlanningUseCase: GetPlanningUseCase,
    private readonly createPlanningUseCase: CreatePlanningUseCase,
    private readonly deletePlanningUseCase: DeletePlanningUseCase,
    private readonly updatePlanningUseCase: UpdatePlanningUseCase,
    private readonly getPlanningsPerMonthUseCase: GetPlanningsPerMonthUseCase,
  ) {
    this.logger.debug('new instance');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/planning-per-month')
  @ApiOperation({
    description: 'Route to get planning per month',
  })
  async getEssayPerMonth(
    @Query()
    query: {
      userId?: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const essay = await this.getPlanningsPerMonthUseCase.execute(query);

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
    description: 'Route to list plannings',
  })
  async list(
    @Req() req: Request,
    @Res() res: Response,
    @Query() input: InputPaginated<IPlanning>,
  ) {
    let plannings = await this.listPlanningUseCase.execute(input);

    if (plannings.isRight()) {
      plannings = right(serializePagination(PlanningEntity, plannings.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: plannings,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/:id')
  @HttpCode(200)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to get planning by id',
  })
  async get(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    let planning = await this.getPlanningUseCase.execute({
      by: 'id',
      value: id,
    });

    if (planning.isRight()) {
      planning = right(plainToInstance(PlanningEntity, planning.value));
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: planning,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('/')
  @HttpCode(200)
  @ApiOperation({
    description: 'Route to create planning',
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputCreatePlanning,
  ) {
    let planning = await this.createPlanningUseCase.execute(input);

    if (planning.isRight()) {
      planning = right(plainToInstance(PlanningEntity, planning.value));
    }

    if (planning.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: planning,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: planning,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to delete planning by id',
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const planning = await this.deletePlanningUseCase.execute({ id });

    if (planning.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: planning,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: planning,
      loggerInstance: this.logger,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put('/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOperation({
    description: 'Route to update planning by id',
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Body() input: InputUpdatePlanning,
    @Param('id') id: string,
  ) {
    let planning = await this.updatePlanningUseCase.execute({
      id,
      data: input,
    });

    if (planning.isRight()) {
      planning = right(plainToInstance(PlanningEntity, planning.value));
    }

    if (planning.isLeft()) {
      return sendUseCaseHttpResponse({
        req,
        res,
        resource: planning,
        loggerInstance: this.logger,
      });
    }

    return sendUseCaseHttpResponse({
      req,
      res,
      resource: planning,
      loggerInstance: this.logger,
    });
  }
}

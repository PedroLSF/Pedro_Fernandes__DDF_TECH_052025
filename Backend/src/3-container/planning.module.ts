import { Module } from '@nestjs/common';
import { IPlanningRepositoryToken } from '@business/repositories/planningRepository';
import { PlanningRepository } from '@framework/repositories/planningRepository';
import { GetPlanningUseCase } from '@business/useCases/planning/getPlanningUseCase';
import { DeletePlanningUseCase } from '@business/useCases/planning/deletePlanningUseCase';
import { UpdatePlanningUseCase } from '@business/useCases/planning/updatePlanningUseCase';
import { ListPlanningUseCase } from '@business/useCases/planning/listPlanningUseCase';
import { CreatePlanningUseCase } from '@business/useCases/planning/createPlanningUseCase';
import { PlanningController } from '@framework/controllers/planning.controller';
import { CountPlanningUseCase } from '@business/useCases/planning/countPlanningUseCase';
import { GetPlanningsPerMonthUseCase } from '@business/useCases/planning/getPlanningsPerMonthUseCase';

@Module({
  imports: [],
  providers: [
    {
      provide: IPlanningRepositoryToken,
      useClass: PlanningRepository,
    },
    GetPlanningUseCase,
    CreatePlanningUseCase,
    UpdatePlanningUseCase,
    ListPlanningUseCase,
    DeletePlanningUseCase,
    CountPlanningUseCase,
    GetPlanningsPerMonthUseCase,
  ],
  controllers: [PlanningController],
  exports: [
    IPlanningRepositoryToken,
    GetPlanningUseCase,
    CreatePlanningUseCase,
    UpdatePlanningUseCase,
    ListPlanningUseCase,
    DeletePlanningUseCase,
    CountPlanningUseCase,
    GetPlanningsPerMonthUseCase,
  ],
})
export class PlanningModule {}

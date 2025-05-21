import { Module } from '@nestjs/common';
import { IEssayRepositoryToken } from '@business/repositories/essayRepository';
import { EssayRepository } from '@framework/repositories/essayRepository';
import { GetEssayUseCase } from '@business/useCases/essay/getEssayUseCase';
import { DeleteEssayUseCase } from '@business/useCases/essay/deleteEssayUseCase';
import { UpdateEssayUseCase } from '@business/useCases/essay/updateEssayUseCase';
import { ListEssayUseCase } from '@business/useCases/essay/listEssayUseCase';
import { CreateEssayUseCase } from '@business/useCases/essay/createEssayUseCase';
import { EssayController } from '@framework/controllers/essay.controller';
import { CountEssayUseCase } from '@business/useCases/essay/countEssayUseCase';
import { GetEssaysPerMonthUseCase } from '@business/useCases/essay/getEssaysPerMonthUseCase';
import { GetEssaysPerThemeUseCase } from '@business/useCases/essay/getEssaysPerThemeUseCase';
import { GetEssaysPerStatusUseCase } from '@business/useCases/essay/getEssaysPerStatusUseCase';
import { GetEssaysAvgUseCase } from '@business/useCases/essay/getEssaysAvgUseCase';

@Module({
  imports: [],
  providers: [
    {
      provide: IEssayRepositoryToken,
      useClass: EssayRepository,
    },
    GetEssayUseCase,
    CreateEssayUseCase,
    UpdateEssayUseCase,
    ListEssayUseCase,
    DeleteEssayUseCase,
    CountEssayUseCase,
    GetEssaysPerMonthUseCase,
    GetEssaysPerThemeUseCase,
    GetEssaysPerStatusUseCase,
    GetEssaysAvgUseCase,
  ],
  controllers: [EssayController],
  exports: [
    IEssayRepositoryToken,
    GetEssayUseCase,
    CreateEssayUseCase,
    UpdateEssayUseCase,
    ListEssayUseCase,
    DeleteEssayUseCase,
    CountEssayUseCase,
    GetEssaysPerMonthUseCase,
    GetEssaysPerThemeUseCase,
    GetEssaysPerStatusUseCase,
    GetEssaysAvgUseCase,
  ],
})
export class EssayModule {}

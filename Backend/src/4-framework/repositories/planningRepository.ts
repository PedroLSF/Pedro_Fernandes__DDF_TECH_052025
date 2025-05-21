import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InputCreatePlanningRepositoryDto,
  InputDeletePlanningRepositoryDto,
  InputFindByPlanningRepositoryDto,
  InputListPlanningRepositoryDto,
  InputUpdatePlanningRepositoryDto,
  IPlanningRepository,
  OutputCountPlanningRepositoryDto,
  OutputCreatePlanningRepositoryDto,
  OutputDeletePlanningRepositoryDto,
  OutputFindByPlanningRepositoryDto,
  OutputListPlanningRepositoryDto,
  OutputUpdatePlanningRepositoryDto,
  InputCountPlanningRepositoryDto,
  InputPlanningPerMonthRepositoryDto,
  OutputPlanningPerMonthRepositoryDto,
} from '@business/repositories/planningRepository';
import { PrismaService } from '@framework/database/prisma.service';
import { handleErrorLog } from '@shared/error';
import { left, right } from '@shared/either';
import {
  getPlanningPerMonthError,
  planningCountError,
  planningCreateError,
  planningDeleteErrorr,
  planningFindByError,
  planningListError,
  planningNotFoundError,
  planningUpdateErrorr,
} from '@business/errors/planning';
import { plainToInstance } from 'class-transformer';
import { IPlanning, PlanningEntity } from '@domain/entities/planning';
import { DEFAULT_PAGE_SIZE } from '@shared/pagination';
import { Prisma } from '@prisma/client';
import { generateId, IdPrefixes } from '@utils/id';
import { makeFilter } from '@utils/filter';
import { cast } from '@utils/caster';
import { orderBy } from '@utils/order';

@Injectable()
export class PlanningRepository implements IPlanningRepository {
  private readonly logger: Logger = new Logger(PlanningRepository.name, {
    timestamp: true,
  });

  constructor(private readonly prismaService: PrismaService) {
    this.logger.debug('new instance');
  }

  async count(
    input: InputCountPlanningRepositoryDto,
  ): Promise<OutputCountPlanningRepositoryDto> {
    try {
      const filter: Prisma.PlanningWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'title',
            },
            {
              operator: 'gte',
              field: 'created_at',
              value: cast(input?.filter?.start_date, (value) => value),
            },
            {
              operator: 'lte',
              field: 'created_at',
              value: cast(input?.filter?.end_date, (value) => value),
            },
          ],
        }),
      };

      return right(
        await this.prismaService.planning.count({
          where: {
            deleted_at: null,
            ...filter,
          },
        }),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningCountError);
    }
  }

  async getPlanningsPerMonth(
    query: InputPlanningPerMonthRepositoryDto,
  ): Promise<OutputPlanningPerMonthRepositoryDto> {
    try {
      const whereClause = query.userId
        ? Prisma.sql`WHERE user_id = ${query.userId}`
        : Prisma.empty;

      const result = await this.prismaService.$queryRaw<
        { month: string; count: bigint }[]
      >(
        Prisma.sql`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') AS month,
          COUNT(*) AS count
        FROM Plannings
        ${whereClause}
        GROUP BY month
        ORDER BY month;
      `,
      );

      const formatted = result.map((item) => ({
        month: item.month,
        count: Number(item.count),
      }));

      return right(formatted);
    } catch (error) {
      return left(getPlanningPerMonthError);
    }
  }

  async create(
    input: InputCreatePlanningRepositoryDto,
  ): Promise<OutputCreatePlanningRepositoryDto> {
    try {
      return right(
        plainToInstance(
          PlanningEntity,
          await this.prismaService.planning.create({
            data: {
              id: generateId(IdPrefixes.planning),
              ...input,
            },
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningCreateError);
    }
  }

  async delete(
    input: InputDeletePlanningRepositoryDto,
  ): Promise<OutputDeletePlanningRepositoryDto> {
    try {
      const planning = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (planning.isLeft()) {
        return left(planning.value);
      }
      return right(
        Boolean(
          await this.prismaService.planning.update({
            where: {
              id: input.id,
            },
            data: {
              deleted_at: new Date(),
            },
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningDeleteErrorr);
    }
  }

  async findBy(
    input: InputFindByPlanningRepositoryDto,
  ): Promise<OutputFindByPlanningRepositoryDto> {
    try {
      const planning = await this.prismaService.planning.findFirst({
        where: {
          [input.type]: input.value,
          deleted_at: null,
        },
        include: {
          user: true,
        },
      });
      if (!planning) {
        return left(planningNotFoundError);
      }
      return right(plainToInstance(PlanningEntity, planning));
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningFindByError);
    }
  }

  async list(
    input: InputListPlanningRepositoryDto,
  ): Promise<OutputListPlanningRepositoryDto> {
    try {
      const filter: Prisma.PlanningWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'title',
            },
            {
              operator: 'gte',
              field: 'created_at',
              value: cast(input?.filter?.start_date, (value) => value),
            },
            {
              operator: 'lte',
              field: 'created_at',
              value: cast(input?.filter?.end_date, (value) => value),
            },
          ],
        }),
      };

      const plannings = await this.prismaService.planning.findMany({
        take: input.take || DEFAULT_PAGE_SIZE,
        skip: input.skip || 0,
        where: {
          ...filter,
        },
        include: {
          user: true,
        },
        orderBy: orderBy({
          order: input.order ?? {},
        }) ?? {
          created_at: 'desc',
        },
      });
      return right(plainToInstance(PlanningEntity, plannings) as IPlanning[]);
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningListError);
    }
  }

  async update(
    input: InputUpdatePlanningRepositoryDto,
  ): Promise<OutputUpdatePlanningRepositoryDto> {
    try {
      const planning = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (planning.isLeft()) {
        return left(planning.value);
      }
      return right(
        plainToInstance(
          PlanningEntity,
          await this.prismaService.planning.update({
            where: {
              id: input.id,
            },
            data: input.data,
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(planningUpdateErrorr);
    }
  }
}

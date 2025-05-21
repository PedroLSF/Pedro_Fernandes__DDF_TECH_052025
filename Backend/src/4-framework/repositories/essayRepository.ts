import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InputCreateEssayRepositoryDto,
  InputDeleteEssayRepositoryDto,
  InputFindByEssayRepositoryDto,
  InputListEssayRepositoryDto,
  InputUpdateEssayRepositoryDto,
  IEssayRepository,
  OutputCountEssayRepositoryDto,
  OutputCreateEssayRepositoryDto,
  OutputDeleteEssayRepositoryDto,
  OutputFindByEssayRepositoryDto,
  OutputListEssayRepositoryDto,
  OutputUpdateEssayRepositoryDto,
  InputCountEssayRepositoryDto,
  OutputEssayPerMonthRepositoryDto,
  OutputEssayPerThemeRepositoryDto,
} from '@business/repositories/essayRepository';
import { PrismaService } from '@framework/database/prisma.service';
import { handleErrorLog } from '@shared/error';
import { left, right } from '@shared/either';
import {
  essayCountError,
  essayCreateError,
  essayDeleteError,
  essayFindByError,
  essayListError,
  essayNotFoundError,
  essayUpdateErrorr,
  getEssayByMonthError,
  getEssayByThemeError,
} from '@business/errors/essay';
import { plainToInstance } from 'class-transformer';
import { IEssay, EssayEntity, EssayPerMonthItem } from '@domain/entities/essay';
import { DEFAULT_PAGE_SIZE } from '@shared/pagination';
import { Prisma } from '@prisma/client';
import { generateId, IdPrefixes } from '@utils/id';
import { makeFilter } from '@utils/filter';
import { cast } from '@utils/caster';
import { orderBy } from '@utils/order';

@Injectable()
export class EssayRepository implements IEssayRepository {
  private readonly logger: Logger = new Logger(EssayRepository.name, {
    timestamp: true,
  });

  constructor(private readonly prismaService: PrismaService) {
    this.logger.debug('new instance');
  }

  async count(
    input: InputCountEssayRepositoryDto,
  ): Promise<OutputCountEssayRepositoryDto> {
    try {
      const filter: Prisma.EssayWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'title',
            },
            {
              field: 'status',
              value: cast(input.filter?.status, (value) =>
                typeof value === 'string' ? value === '1' : Boolean(value),
              ),
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
        await this.prismaService.essay.count({
          where: {
            deleted_at: null,
            ...filter,
            ...(input.filter.user_id ? { user_id: input.filter.user_id } : {}),
          },
        }),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(essayCountError);
    }
  }

  async create(
    input: InputCreateEssayRepositoryDto,
  ): Promise<OutputCreateEssayRepositoryDto> {
    try {
      return right(
        plainToInstance(
          EssayEntity,
          await this.prismaService.essay.create({
            data: {
              id: generateId(IdPrefixes.essay),
              ...input,
            },
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(essayCreateError);
    }
  }

  async delete(
    input: InputDeleteEssayRepositoryDto,
  ): Promise<OutputDeleteEssayRepositoryDto> {
    try {
      const essay = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (essay.isLeft()) {
        return left(essay.value);
      }
      return right(
        Boolean(
          await this.prismaService.essay.update({
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
      return left(essayDeleteError);
    }
  }

  async getEssaysPerMonth(): Promise<OutputEssayPerMonthRepositoryDto> {
    try {
      const result = await this.prismaService.$queryRaw<
        { month: string; count: bigint }[]
      >`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM essays
      GROUP BY month
      ORDER BY month;
    `;

      const formatted = result.map((item) => ({
        ...item,
        count: Number(item.count),
      }));

      return right(formatted);
    } catch (error) {
      return left(getEssayByMonthError);
    }
  }

  async getEssaysPerTheme(): Promise<OutputEssayPerThemeRepositoryDto> {
    try {
      const result = await this.prismaService.$queryRaw<
        { theme: string; count: bigint }[]
      >`
      SELECT
        theme,
        COUNT(*) AS count
      FROM essays
      GROUP BY theme
      ORDER BY count DESC;
    `;

      const formatted = result.map((item) => ({
        theme: item.theme,
        count: Number(item.count),
      }));

      return right(formatted);
    } catch (error) {
      return left(getEssayByThemeError);
    }
  }

  async findBy(
    input: InputFindByEssayRepositoryDto,
  ): Promise<OutputFindByEssayRepositoryDto> {
    try {
      const essay = await this.prismaService.essay.findFirst({
        where: {
          [input.type]: input.value,
          deleted_at: null,
        },
        include: {
          user: true,
        },
      });
      if (!essay) {
        return left(essayNotFoundError);
      }
      return right(plainToInstance(EssayEntity, essay));
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(essayFindByError);
    }
  }

  async list(
    input: InputListEssayRepositoryDto,
  ): Promise<OutputListEssayRepositoryDto> {
    try {
      const filter: Prisma.EssayWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'title',
            },
            {
              field: 'status',
              value: cast(input.filter?.status, (value) =>
                typeof value === 'string' ? value === '1' : Boolean(value),
              ),
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

      const essays = await this.prismaService.essay.findMany({
        take: input.take || DEFAULT_PAGE_SIZE,
        skip: input.skip || 0,
        where: {
          ...filter,
          ...(input.filter.user_id ? { user_id: input.filter.user_id } : {}),
        },
        include: {
          user: true,
        },
      });
      return right(plainToInstance(EssayEntity, essays) as IEssay[]);
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(essayListError);
    }
  }

  async update(
    input: InputUpdateEssayRepositoryDto,
  ): Promise<OutputUpdateEssayRepositoryDto> {
    try {
      const essay = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (essay.isLeft()) {
        return left(essay.value);
      }
      return right(
        plainToInstance(
          EssayEntity,
          await this.prismaService.essay.update({
            where: {
              id: input.id,
            },
            data: {
              title: input.data.title,
              text: input.data.text,
              theme: input.data.theme,
              note: input.data.note ?? null,
              status: input.data.status,
            },
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(essayUpdateErrorr);
    }
  }
}

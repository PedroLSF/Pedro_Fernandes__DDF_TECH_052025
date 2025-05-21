import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InputCountUserRepositoryDto,
  InputCreateUserRepositoryDto,
  InputDeleteUserRepositoryDto,
  InputFindByUserRepositoryDto,
  InputListUserRepositoryDto,
  InputUpdateUserRepositoryDto,
  IUserRepository,
  OutputCountUserRepositoryDto,
  OutputCreateUserRepositoryDto,
  OutputDeleteUserRepositoryDto,
  OutputFindByUserRepositoryDto,
  OutputListUserRepositoryDto,
  OutputUpdateUserRepositoryDto,
} from '@business/repositories/userRepository';
import { PrismaService } from '@framework/database/prisma.service';
import { handleErrorLog } from '@shared/error';
import { left, right } from '@shared/either';
import {
  userCountError,
  userCreateError,
  userDeleteError,
  userFindByError,
  userListError,
  userNotFoundError,
  userUpdateError,
} from '@business/errors/user';
import { plainToInstance } from 'class-transformer';
import { IUser, UserEntity } from '@domain/entities/user';
import { DEFAULT_PAGE_SIZE } from '@shared/pagination';
import { Prisma } from '@prisma/client';
import { generateId, IdPrefixes } from '@utils/id';
import { makeFilter } from '@utils/filter';
import { cast } from '@utils/caster';
import { orderBy } from '@utils/order';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: Logger = new Logger(UserRepository.name, {
    timestamp: true,
  });

  constructor(private readonly prismaService: PrismaService) {
    this.logger.debug('new instance');
  }

  async count(
    input: InputCountUserRepositoryDto,
  ): Promise<OutputCountUserRepositoryDto> {
    try {
      const filter: Prisma.UserWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'name',
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
        await this.prismaService.user.count({
          where: {
            deleted_at: null,
            ...filter,
          },
        }),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(userCountError);
    }
  }

  async create(
    input: InputCreateUserRepositoryDto,
  ): Promise<OutputCreateUserRepositoryDto> {
    try {
      return right(
        plainToInstance(
          UserEntity,
          await this.prismaService.user.create({
            data: {
              id: input.id ?? generateId(IdPrefixes.user),
              ...input,
            },
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(userCreateError);
    }
  }

  async delete(
    input: InputDeleteUserRepositoryDto,
  ): Promise<OutputDeleteUserRepositoryDto> {
    try {
      const user = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (user.isLeft()) {
        return left(user.value);
      }
      return right(
        Boolean(
          await this.prismaService.user.update({
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
      return left(userDeleteError);
    }
  }

  async findBy(
    input: InputFindByUserRepositoryDto,
  ): Promise<OutputFindByUserRepositoryDto> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          [input.type]: input.value,
          deleted_at: null,
        },
        include: {
          _count: {
            select: {
              Essay: { where: { deleted_at: null } },
              Planning: { where: { deleted_at: null } },
            },
          },
        },
      });
      if (!user) {
        return left(userNotFoundError);
      }
      return right(plainToInstance(UserEntity, user));
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(userFindByError);
    }
  }

  async list(
    input: InputListUserRepositoryDto,
  ): Promise<OutputListUserRepositoryDto> {
    try {
      const filter: Prisma.UserWhereInput = {
        ...makeFilter({
          operator: 'AND',
          resource: input.filter,
          definition: [
            {
              operator: 'contains',
              field: 'name',
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
      const users = await this.prismaService.user.findMany({
        take: input.take || DEFAULT_PAGE_SIZE,
        skip: input.skip || 0,
        where: {
          deleted_at: null,
          ...filter,
        },
        include: {
          _count: {
            select: {
              Essay: { where: { deleted_at: null } },
              Planning: { where: { deleted_at: null } },
            },
          },
        },
        orderBy: {
          name: 'desc',
        },
      });
      return right(plainToInstance(UserEntity, users) as IUser[]);
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(userListError);
    }
  }

  async update(
    input: InputUpdateUserRepositoryDto,
  ): Promise<OutputUpdateUserRepositoryDto> {
    try {
      const user = await this.findBy({
        value: input.id,
        type: 'id',
      });
      if (user.isLeft()) {
        return left(user.value);
      }
      return right(
        plainToInstance(
          UserEntity,
          await this.prismaService.user.update({
            where: {
              id: input.id,
            },
            data: input.data,
          }),
        ),
      );
    } catch (error) {
      handleErrorLog(error, this.logger);
      return left(userUpdateError);
    }
  }
}

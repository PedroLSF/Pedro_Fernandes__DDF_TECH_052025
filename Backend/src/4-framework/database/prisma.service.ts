import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { env, isLocal } from '@shared/env';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger: Logger = new Logger(PrismaService.name, {
    timestamp: true,
  });

  constructor() {
    const hideLogs = env('HIDE_PRISMA_LOGS', false) === 'true';
    let prismaOptions: any = {
      log: [{ level: 'query', emit: 'event' }],
    };
    if (!hideLogs) {
      prismaOptions = {
        log: [
          { level: 'query', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
          { level: 'error', emit: 'event' },
        ],
      };
    }
    super(prismaOptions);
    this.logger.debug('new instance');

    if (!hideLogs) {
      this.$on('query' as never, (e: any) =>
        this.logger.debug(e?.query ?? e?.message),
      );
      this.$on('info' as never, (e: any) =>
        this.logger.debug(e?.query ?? e?.message),
      );
      this.$on('warn' as never, (e: any) =>
        this.logger.debug(e?.query ?? e?.message),
      );
      this.$on('error' as never, (e: any) =>
        this.logger.debug(e?.query ?? e?.message),
      );
    }
  }
}

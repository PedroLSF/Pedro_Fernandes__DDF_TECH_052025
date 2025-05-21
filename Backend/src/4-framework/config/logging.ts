import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston/dist/winston.interfaces';
import * as winston from 'winston';
import { LoggerOptions } from 'winston';
import { env, isProd } from '@shared/env';

export const loggingWinstonSettings: () => WinstonModuleOptions &
  LoggerOptions = () => ({
  level: isProd() ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('RedaPlus', {
          colors: true,
          prettyPrint: false,
        }),
      ),
    }),
  ],
});

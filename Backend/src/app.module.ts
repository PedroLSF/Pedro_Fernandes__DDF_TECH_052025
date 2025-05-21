import { AuthModule } from '@container/auth.module';
import { EssayModule } from '@container/essay.module';
import { PlanningModule } from '@container/planning.module';
import { UserModule } from '@container/user.module';
import { envValidationSchema } from '@framework/config/env';
import { registerHttp } from '@framework/config/http';
import { loggingWinstonSettings } from '@framework/config/logging';
import { PrismaModule } from '@framework/database/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    // core modules
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    WinstonModule.forRoot(loggingWinstonSettings()),
    registerHttp(),
    PrismaModule,
    // app modules
    AuthModule,
    UserModule,
    EssayModule,
    PlanningModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}

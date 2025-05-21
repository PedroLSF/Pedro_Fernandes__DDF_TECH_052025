import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@framework/database/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

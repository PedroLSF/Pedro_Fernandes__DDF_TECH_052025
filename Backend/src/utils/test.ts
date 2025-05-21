import { PrismaService } from '@framework/database/prisma.service';
import { TestingModuleBuilder } from '@nestjs/testing';

export const disablePrisma = (module: TestingModuleBuilder) =>
  module.overrideProvider(PrismaService).useValue({});

export const disableExternalServices = (module: TestingModuleBuilder) =>
  disablePrisma(module);

// import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { envOrThrow } from '@shared/env';
import { Request, Response } from 'express';

export function setupStatic(app: NestExpressApplication) {
  app.useStaticAssets(join(__dirname, '../../../', 'public'), {
    prefix: '/public/',
  });
  app.setBaseViewsDir(join(__dirname, '../../../', 'views'));
  app.setViewEngine('hbs');
}

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle(`Api documentation - RedaPlus`)
    .setDescription(
      `
-----------------------------------------------------
To use the documentation, you must authorize yourself through the following steps: \n
1) Log in to the /auth/sign-in route with your credentials. \n
2) Use the generated token to authorize requests in the Authorize.
-----------------------------------------------------
    `,
    )
    .setContact(
      'iTalents',
      'https://www.italents.com.br/',
      'contato@italents.com',
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {});
}

export function setupPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const message = errors
          .filter((error) => error.constraints)
          .map((error) => Object.values({ ...error.constraints }))
          .flat()
          .shift();
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message,
        });
      },
    }),
  );
}

export async function setupServer(app: INestApplication) {
  app.use(compression());
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: false,
  //   }),
  // );
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute,
      max: 500 * 60, // 50 requests per second
      message: 'Too many requests from this IP, please try again later.',
    }),
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  app.set('trust proxy', 1);

  await app.listen(+envOrThrow('SERVER_PORT'));
}

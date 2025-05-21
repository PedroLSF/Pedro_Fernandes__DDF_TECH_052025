import { HttpModule } from '@nestjs/axios';
import { envOrThrow } from '@shared/env';

export const registerHttp = () =>
  HttpModule.registerAsync({
    useFactory: () => ({
      timeout: +envOrThrow('SERVER_HTTP_TIMEOUT_MS'),
      maxRedirects: 5,
    }),
  });

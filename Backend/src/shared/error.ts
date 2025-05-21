import { Logger } from '@nestjs/common';
import { env, setEnv } from '@shared/env';

export interface IError {
  httpCode: number;
  code: string;
  message: string;
  shortMessage: string;
}

export const bindGenericError = (error: Error & any): IError => ({
  code: error?.code ?? 500,
  httpCode: error?.httpCode ?? 500,
  message: error?.message ?? error?.response?.message ?? 'unknown',
  shortMessage: error?.shortMessage ?? '',
});

export const handleErrorLog = (error: Error & any, loggerInstance?: Logger) => {
  const omitKey = 'OMIT_ERROR_LOGGING_ONCE';
  const testEnvironment = ['test', 'testing'];
  const omit =
    testEnvironment.includes(env('NODE_ENV')) && env(omitKey) === 'once';
  if (omit) {
    setEnv(omitKey, 'never');
    return;
  }
  loggerInstance?.error?.({
    message: error?.response?.data?.message ?? error?.message ?? 'unknown',
    ...error,
  });
  console.error(error);
};

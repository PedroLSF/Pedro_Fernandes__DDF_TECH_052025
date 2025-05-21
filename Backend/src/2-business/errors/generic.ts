import { IError } from '@shared/error';

export const jwtSigInFail: IError = {
  httpCode: 500,
  code: 'GEN-001',
  shortMessage: 'jwtSignInFail',
  message: 'Houve um erro ao autenticar o usuário.',
};

export const jwtVerifyFail: IError = {
  httpCode: 500,
  code: 'GEN-002',
  shortMessage: 'jwtVerifyFail',
  message: 'Houve um erro ao verificar o usuário.',
};

export const notAuthorizedError: IError = {
  httpCode: 401,
  code: 'GEN-003',
  shortMessage: 'notAuthorizedError',
  message: 'Não autorizado.',
};

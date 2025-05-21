import { IError } from '@shared/error';

export const userCountError: IError = {
  httpCode: 500,
  code: 'USR-001',
  shortMessage: 'userCountError',
  message: 'Houve um erro ao contar users.',
};

export const userCreateError: IError = {
  httpCode: 500,
  code: 'USR-002',
  shortMessage: 'userCreateError',
  message: 'Houve um erro ao criar um user.',
};

export const userDeleteError: IError = {
  httpCode: 500,
  code: 'USR-003',
  shortMessage: 'userDeleteError',
  message: 'Houve um erro ao deletar user.',
};

export const userNotFoundError: IError = {
  httpCode: 404,
  code: 'USR-004',
  shortMessage: 'userNotFoundError',
  message: 'Houve um erro ao buscar user.',
};

export const userFindByError: IError = {
  httpCode: 404,
  code: 'USR-005',
  shortMessage: 'userFindByError',
  message: 'Houve um erro ao buscar user.',
};

export const userListError: IError = {
  httpCode: 500,
  code: 'USR-006',
  shortMessage: 'userListError',
  message: 'Houve um erro ao listar users.',
};

export const userUpdateError: IError = {
  httpCode: 500,
  code: 'USR-007',
  shortMessage: 'userUpdateError',
  message: 'Houve um erro ao atualizar um user.',
};

export const userCreateAlreadyExistsError: IError = {
  httpCode: 500,
  code: 'USR-008',
  shortMessage: 'userCreateAlreadyExistsError',
  message: 'Houve um erro ao criar um user, e-mail já cadastrado.',
};

export const userCreateIdentityProviderNotSuportedError: IError = {
  httpCode: 500,
  code: 'USR-008',
  shortMessage: 'userCreateIdentityProviderNotSuportedError',
  message: 'Houve um erro ao criar um user, identity_provider não reconhecido.',
};

export const userUpdatePasswordNotMathError: IError = {
  httpCode: 400,
  code: 'USR-009',
  shortMessage: 'userUpdatePasswordNotMathError',
  message: 'Houve um erro ao atualizar a senha, as senhas devem ser iguais.',
};

export const userUpdatePasswordNotStrongError: IError = {
  httpCode: 400,
  code: 'USR-010',
  shortMessage: 'userUpdatePasswordNotStrongError',
  message:
    'Houve um erro ao atualizar a senha, a senha não é forte o suficiente.',
};

export const userGetProfileError: IError = {
  httpCode: 403,
  code: 'USR-011',
  shortMessage: 'userGetProfileError',
  message: 'Houve um erro ao buscar perfil.',
};

export const userPutProfileError: IError = {
  httpCode: 403,
  code: 'USR-012',
  shortMessage: 'userPutProfileError',
  message: 'Houve um erro ao atualizar perfil.',
};

export const userUpdatePasswordError: IError = {
  httpCode: 403,
  code: 'USR-013',
  shortMessage: 'userUpdatePasswordError',
  message: 'Houve um erro ao atualizar perfil.',
};

import { IError } from '@shared/error';

export const planningCountError: IError = {
  httpCode: 500,
  code: 'PLG-001',
  shortMessage: 'planningCountError',
  message: 'Houve um erro ao contar logs de atividade.',
};

export const planningCreateError: IError = {
  httpCode: 500,
  code: 'PLG-002',
  shortMessage: 'planningCreateError',
  message: 'Houve um erro ao criar um planejamento.',
};

export const planningNotFoundError: IError = {
  httpCode: 404,
  code: 'PLG-003',
  shortMessage: 'planningNotFoundError',
  message: 'Houve um erro ao buscar planejamento.',
};

export const planningFindByError: IError = {
  httpCode: 404,
  code: 'PLG-004',
  shortMessage: 'planningFindByError',
  message: 'Houve um erro ao buscar planejamento.',
};

export const planningListError: IError = {
  httpCode: 500,
  code: 'PLG-005',
  shortMessage: 'planningListError',
  message: 'Houve um erro ao listar planejamentos.',
};

export const planningVideosListError: IError = {
  httpCode: 500,
  code: 'PLG-006',
  shortMessage: 'planningListError',
  message: 'Houve um erro ao listar planejamentos.',
};

export const planningUpdateErrorr: IError = {
  httpCode: 500,
  code: 'ESA-007',
  shortMessage: 'planningUpdateError',
  message: 'Houve um erro ao atualizar planejamento.',
};

export const planningDeleteErrorr: IError = {
  httpCode: 500,
  code: 'ESA-008',
  shortMessage: 'planningDeleteErrorr',
  message: 'Houve um erro ao excluir planejamentos.',
};

export const getPlanningPerMonthError: IError = {
  httpCode: 500,
  code: 'ESA-009',
  shortMessage: 'getPlanningPerMonthError',
  message: 'Houve um erro ao obter planejamentos mensais.',
};

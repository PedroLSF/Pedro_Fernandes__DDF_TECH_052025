import { IError } from '@shared/error';

export const essayCountError: IError = {
  httpCode: 500,
  code: 'ESA-001',
  shortMessage: 'essayCountError',
  message: 'Houve um erro ao contar logs de atividade.',
};

export const essayCreateError: IError = {
  httpCode: 500,
  code: 'ESA-002',
  shortMessage: 'essayCreateError',
  message: 'Houve um erro ao criar um redação.',
};

export const essayNotFoundError: IError = {
  httpCode: 404,
  code: 'ESA-003',
  shortMessage: 'essayNotFoundError',
  message: 'Houve um erro ao buscar redação.',
};

export const essayFindByError: IError = {
  httpCode: 404,
  code: 'ESA-004',
  shortMessage: 'essayFindByError',
  message: 'Houve um erro ao buscar redação.',
};

export const essayListError: IError = {
  httpCode: 500,
  code: 'ESA-005',
  shortMessage: 'essayListError',
  message: 'Houve um erro ao listar redações.',
};

export const essayRedaçõesListError: IError = {
  httpCode: 500,
  code: 'ESA-006',
  shortMessage: 'essayListError',
  message: 'Houve um erro ao listar redações.',
};

export const essayUpdateErrorr: IError = {
  httpCode: 500,
  code: 'ESA-007',
  shortMessage: 'essayUpdateError',
  message: 'Houve um erro ao atualizar redação.',
};

export const essayDeleteError: IError = {
  httpCode: 500,
  code: 'ESA-008',
  shortMessage: 'essayDeleteErrorr',
  message: 'Houve um erro ao excluir redações.',
};

export const getEssayByMonthError: IError = {
  httpCode: 500,
  code: 'ESA-009',
  shortMessage: 'getEssayByMonthError',
  message: 'Houve um erro ao obter Redações por mês.',
};

export const getEssayByThemeError: IError = {
  httpCode: 500,
  code: 'ESA-010',
  shortMessage: 'getEssayByThemeError',
  message: 'Houve um erro ao obter Redações por tema.',
};

export const getEssayByStatusError: IError = {
  httpCode: 500,
  code: 'ESA-011',
  shortMessage: 'getEssayByStatusError',
  message: 'Houve um erro ao obter Redações por status.',
};

export const getEssayAVGNoteError: IError = {
  httpCode: 500,
  code: 'ESA-012',
  shortMessage: 'getEssayAVGNoteError',
  message: 'Houve um erro ao obter média das notas.',
};

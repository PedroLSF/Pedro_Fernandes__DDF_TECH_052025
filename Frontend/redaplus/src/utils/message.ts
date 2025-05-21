export const successUpdateText = (resource: string, useMale = false): string =>
  `${resource} atualiz${useMale ? 'ado' : 'ada'}!`;

export const successReadNotification = (): string => `Notificação lida com sucesso.`;

export const successArchiveNotification = (): string => `Notificação arquivada com sucesso.`;

export const errorReadNotification = (): string => `Erro ao ler a notificação.`;

export const errorArchiveNotification = (): string => `Erro ao arquivar a notificação.`;

export const failUpdateText = (resource: string, useMale = false): string =>
  `Erro ao atualizar ${useMale ? 'o' : 'a'} ${resource}.`;

export const successCreateText = (resource: string, useMale = false): string =>
  `Nov${useMale ? 'o' : 'a'} ${resource} criad${useMale ? 'o' : 'a'}!`;

export const failCreateText = (resource: string, useMale = false): string =>
  `Erro ao criar nov${useMale ? 'o' : 'a'} ${resource}.`;

export const successActiveTexts = (resource: string, useMale = false): string =>
  `${resource} ativ${useMale ? 'ados' : 'adas'}!`;

export const failActiveTexts = (resource: string, useMale = false): string =>
  `Erro ao ativar ${useMale ? 'os' : 'as'} ${resource}.`;

export const successInactiveTexts = (resource: string, useMale = false): string =>
  `${resource} inativ${useMale ? 'ados' : 'adas'}!`;

export const failInactiveTexts = (resource: string, useMale = false): string =>
  `Erro ao inativar ${useMale ? 'os' : 'as'} ${resource}.`;

export const successDeleteText = (resource: string, useMale = false, plural = false): string =>
  `${resource} deletad${useMale ? 'o' : 'a'}${plural ? 's' : ''}!`;

export const failDeleteText = (resource: string): string => `Erro ao excluir ${resource}.`;

export const successUpdatePassword = (): string => `Senha atualizada com sucesso!`;

export const failUpdatePassword = (): string => `Erro ao atualizar senha`;

export const invalidText = (resource: string, useMale = false): string => `${resource} inválido.`;

export const successGenericText = (): string => `Salvo com sucesso!`;
export const failGenericText = (error?: any): string =>
  error?.response?.data?.message ?? error?.message ?? `Erro ao salvar.`;
export const emailNotFound = (): string => `E-mail não encontrado`;

export const recoveryPasswordFail = (): string =>
  `Houve um erro ao recuperar a senha. Código incorreto`;

export const failEntityExistsText = (resource: string, useMale: boolean = false): string =>
  `Ess${useMale ? 'e' : 'a'} ${resource} já existe.`;

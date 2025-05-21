// ----------------------------------------------------------------------

import { PRIORITY_LOW, PRIORITY_HIGH, PRIORITY_MEDIUM } from 'src/utils/generics';

export const VIDEO_STATUS_OPTIONS = [
  { value: 'paid', label: 'Disciplina X' },
  { value: 'pending', label: 'Disciplina Y' },
  { value: 'overdue', label: 'Disciplina Z' },
];

export const VIDEO_TRACK_STATUS_OPTIONS = [
  { value: PRIORITY_HIGH, label: 'Alta' },
  { value: PRIORITY_MEDIUM, label: 'Média' },
  { value: PRIORITY_LOW, label: 'Baixa' },
];

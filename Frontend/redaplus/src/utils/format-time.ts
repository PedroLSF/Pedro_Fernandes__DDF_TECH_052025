/* eslint-disable import/no-duplicates */
import { ptBR } from 'date-fns/locale';
import { format, getTime, endOfDay, startOfDay, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return !Number.isNaN(d.getTime()) && d.toISOString() === str; // valid date
}

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat ?? 'dd/MM/yyyy';
  return date ? format(new Date(date), fm, { locale: ptBR }) : '';
}

export function fTime(date: InputValue, newFormat?: string) {
  const fm = newFormat ?? 'kk:mm';

  return date ? format(new Date(date), fm, { locale: ptBR }) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat ?? 'dd/MM/yyyy - kk:mm';

  return date ? format(new Date(date), fm, { locale: ptBR }) : '';
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      })
    : '';
}

export function isBetween(inputDate: Date | string | number, startDate: Date, endDate: Date) {
  const date = new Date(inputDate);

  return (
    new Date(date.toDateString()) >= new Date(startDate.toDateString()) &&
    new Date(date.toDateString()) <= new Date(endDate.toDateString())
  );
}

export function isAfter(startDate: Date | null | string, endDate: Date | null | string) {
  return startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;
}

export function fDateStartOfDay(date: Date | string | number, newFormat?: string) {
  const start = startOfDay(new Date(date));
  return format(start, newFormat ?? 'yyyy-MM-dd HH:mm:ss.SSS');
}

export function fDateEndOfDay(date: Date | string | number, newFormat?: string) {
  const start = endOfDay(new Date(date));
  return format(start, newFormat ?? 'yyyy-MM-dd HH:mm:ss.SSS');
}

export function formatStartOfDay(date: Date | string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(3, 0, 0, 0);
  return d.toISOString();
}

export function formatEndOfDay(date: Date | string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(2, 59, 59, 999);
  return d.toISOString();
}

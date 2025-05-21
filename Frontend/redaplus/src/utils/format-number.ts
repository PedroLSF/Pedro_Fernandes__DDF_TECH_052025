// ----------------------------------------------------------------------

/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

type InputValue = string | number | null;

function getLocaleCode() {
  return {
    code: 'pt-BR',
    currency: 'BRL',
  };
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return '-';

  const number = Number(inputValue);

  return new Intl.NumberFormat(code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue: InputValue) {
  const { code, currency } = getLocaleCode();

  if (!inputValue) return '';

  const number = Number(inputValue);

  return new Intl.NumberFormat(code, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return '';

  if (typeof inputValue === 'string') {
    return inputValue;
  }

  const number = Number(inputValue) / 100;

  return new Intl.NumberFormat(code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number);
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return '';

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat(code, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputValue) {
  if (!inputValue) return '';

  if (inputValue === 0) return '0 Bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];

  const decimal = 2;

  const baseValue = 1024;

  const number = Number(inputValue);

  const index = Math.floor(Math.log(number) / Math.log(baseValue));

  return `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;
}

export function fSecondsToHms(inputValue: InputValue) {
  if (!inputValue) return '00:00:00';

  if (typeof inputValue === 'string' && inputValue.includes(':')) return inputValue;

  const secNum = parseInt(inputValue as string, 10);

  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum - hours * 3600) / 60);
  const seconds = secNum - hours * 3600 - minutes * 60;

  let h = hours.toString();
  let m = minutes.toString();
  let s = seconds.toString();

  if (hours < 10) h = `0${hours}`;
  if (minutes < 10) m = `0${minutes}`;
  if (seconds < 10) s = `0${seconds}`;

  return `${h}:${m}:${s}`;
}

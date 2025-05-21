export function cast<
  T extends string | boolean | undefined | object,
  K extends T,
>(
  value: T,
  caster: (value: T) => K,
  options?: { dontParseBooleanString?: boolean },
): K | undefined {
  if (typeof value === 'undefined' || value === null || value === '') {
    return undefined;
  }

  if (!Boolean(options?.dontParseBooleanString) && typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'false') {
      return caster((lower === 'true') as T);
    }
  }

  return caster(value);
}

export const isValidOrNull = (val: any): boolean =>
  val === null || typeof val !== 'undefined';

export const booleanString = (str?: string) =>
  Boolean(str) && (str === '1' || str === 'true');

export const convertSecondsToHms = (inputValue: string | number): string => {
  if (!inputValue) return '00:00:00';

  if (typeof inputValue === 'string' && inputValue.includes(':'))
    return inputValue;

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
};

export const hmsToSeconds = (hms: string): number => {
  if (!hms) return 0;

  const [hours, minutes, seconds] = hms.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

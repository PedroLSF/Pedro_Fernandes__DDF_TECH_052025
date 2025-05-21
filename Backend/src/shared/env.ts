export const env = <T>(prop: string, defaultValue?: any): T | null =>
  (process.env[prop] as T | undefined) ?? defaultValue ?? null;

export const setEnv = <T extends string>(prop: string, value: T): void => {
  process.env[prop] = value;
};

export const envOrThrow = <T extends string>(prop: string): T => {
  if (prop in process.env) {
    return process.env[prop] as T;
  }
  throw new Error(`The [${prop.toUpperCase()}] env key not exists.`);
};

export const isProd = () => env<string>('APP_ENV') === 'production';
export const isLocal = () => env('APP_ENV') === 'local';
export const redisMonitorEnabled = () => env('DEBUG') === '*';
export const isDevelop = () => env('APP_ENV') === 'develop';

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
export type AnyObject = Record<string, any>;
export type CustomObject<T extends AnyObject> = Record<string, T>;
export type NumberObject = Record<string, number>;
export type StringObject = Record<string, string>;

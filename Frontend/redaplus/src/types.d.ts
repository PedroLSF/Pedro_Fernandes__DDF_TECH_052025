type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type AnyObject = Record<string, any>;
type CustomObject<T extends AnyObject> = Record<string, T>;
type NumberObject = Record<string, number>;
type StringObject = Record<string, string>;
type AnyCallback = (...args: any[]) => any;

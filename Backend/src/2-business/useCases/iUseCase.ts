import { Injectable, Logger } from '@nestjs/common';

export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

export interface UseCaseOptions {
  logEnabled?: boolean;
}

export function UseCaseOptions(options: UseCaseOptions) {
  return function <T extends { new (...args: any[]): NonNullable<unknown> }>(
    constructor: T,
  ) {
    const wrapperClass = class extends constructor {
      options: UseCaseOptions = { logEnabled: options.logEnabled || false };
    };
    Object.defineProperty(wrapperClass, 'name', {
      get: () => `${constructor.name}`,
    });
    return wrapperClass;
  };
}

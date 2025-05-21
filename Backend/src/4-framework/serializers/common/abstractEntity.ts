import { plainToInstance } from 'class-transformer';

export abstract class Entity<T> {
  constructor(partial: Partial<T>) {
    Object.assign(this, plainToInstance(this.constructor as any, partial));
  }
}

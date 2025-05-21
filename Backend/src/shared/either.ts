export type Either<L, A> = Left<L, A> | Right<L, A>;

export class Left<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return true;
  }

  isRight(): this is Right<L, A> {
    return false;
  }

  // toJson(): string {
  //   return JSON.stringify({
  //     value: this.value,
  //     isRight: this.isRight(),
  //   });
  // }
  //
  // fromJson(json: string): Either<L, A> {
  //   const { value, isRight } = JSON.parse(json);
  //   if (isRight) {
  //     return right(value);
  //   }
  //   return left(value);
  // }
}

export class Right<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return false;
  }

  isRight(): this is Right<L, A> {
    return true;
  }
}

export const left = <L, A>(l: L): Either<L, A> => {
  return new Left(l);
};

export const right = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};

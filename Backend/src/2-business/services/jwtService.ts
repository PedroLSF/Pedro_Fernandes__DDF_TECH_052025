import { Either } from '@shared/either';
import { IError } from '@shared/error';

export interface JwtPayload {
  sub: string;
  email?: string;
  [key: string]: any;
}

export type SignJwtDto = {
  payload: JwtPayload;
  expiresIn?: string | number;
};

export type VerifyJwtDto = {
  token: string;
};

export interface IJwtService {
  sign(input: SignJwtDto): Promise<Either<IError, string>>;
  verify(input: VerifyJwtDto): Promise<Either<IError, JwtPayload>>;
}

export const IJwtServiceToken = Symbol('IJwtService');

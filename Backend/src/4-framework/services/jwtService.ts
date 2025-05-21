import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import {
  IJwtService,
  SignJwtDto,
  VerifyJwtDto,
  JwtPayload,
} from '@business/services/jwtService';
import { Either, left, right } from '@shared/either';
import { IError } from '@shared/error';
import { jwtSigInFail, jwtVerifyFail } from '@business/errors/generic';

@Injectable()
export class JwtService implements IJwtService {
  constructor(private readonly jwt: NestJwtService) {}

  async sign(input: SignJwtDto): Promise<Either<IError, string>> {
    try {
      const token = await this.jwt.signAsync(input.payload, {
        expiresIn: input.expiresIn || '1h',
      });
      return right(token);
    } catch (err) {
      return left(jwtSigInFail);
    }
  }

  async verify(input: VerifyJwtDto): Promise<Either<IError, JwtPayload>> {
    try {
      const payload = await this.jwt.verifyAsync(input.token);
      return right(payload);
    } catch (err) {
      return left(jwtVerifyFail);
    }
  }
}

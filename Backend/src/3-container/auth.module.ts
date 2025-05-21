import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@framework/services/jwtService';
import { IJwtServiceToken } from '@business/services/jwtService';
import { AuthenticateUserUseCase } from '@business/useCases/auth/authenticateUserUseCase';
import { JwtStrategy } from '@framework/guard/jwt.strategy';
import { UserModule } from './user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '5h' },
    }),
    UserModule,
  ],
  providers: [
    {
      provide: IJwtServiceToken,
      useClass: JwtService,
    },
    JwtStrategy,
    AuthenticateUserUseCase,
  ],
  exports: [IJwtServiceToken, AuthenticateUserUseCase],
})
export class AuthModule {}

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/config/database/prisma.service';
import { LoginValidationMiddleware } from 'src/config/middleware/login-validation.middleware';
import { JwtStrategy } from 'src/config/strategy/jwt.strategt';
import { LocalStrategy } from 'src/config/strategy/local.strategy';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthRepository } from 'src/repositories/auth-repository';
import { AuthService } from 'src/services/auth.service';
import { UserModule } from './user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    {
      provide: AuthRepository,
      useClass: AuthService,
    },
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthRepository],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes('login');
  }
}

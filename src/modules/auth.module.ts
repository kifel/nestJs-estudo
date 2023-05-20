import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginValidationMiddleware } from 'src/config/middleware/login-validation.middleware';
import { PrismaService } from '../config/database/prisma.service';
import { JwtStrategy } from '../config/strategy/jwt.strategt';
import { LocalStrategy } from '../config/strategy/local.strategy';
import { AuthController } from '../controllers/auth.controller';
import { AuthRepository } from '../repositories/auth-repository';
import { AuthService } from '../services/auth.service';
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

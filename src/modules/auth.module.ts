import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/config/database/prisma.service';
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
  ],
})
export class AuthModule {}

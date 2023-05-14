import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { JwtAuthGuard } from './config/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

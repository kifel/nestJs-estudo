import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggingMiddleware } from 'src/config/middleware/Logging.middleware';
import { JwtAuthGuard } from '../config/guards/jwt-auth.guard';
import { RolesGuard } from '../config/guards/roles.guard';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

import { Module } from '@nestjs/common';
import { PrismaService } from '../config/database/prisma.service';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repositories/user-repository';
import { UserService } from '../services/user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: UserService,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}

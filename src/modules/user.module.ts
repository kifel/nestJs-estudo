import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/repositories/user-repository';
import { UserService } from 'src/services/user.service';

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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';
import { PrimaRocketMembersRepository } from './repositories/prisma/prisma-rocket-members-repository';
import { RocketMembersRepository } from './repositories/rocket-members-repository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: RocketMembersRepository,
      useClass: PrimaRocketMembersRepository,
    },
  ],
})
export class AppModule {}

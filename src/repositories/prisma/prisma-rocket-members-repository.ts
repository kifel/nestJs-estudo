import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTeamMemberResponse } from 'src/dtos/create-team-member-response';
import { RocketMembersRepository } from '../rocket-members-repository';

@Injectable()
export class PrimaRocketMembersRepository implements RocketMembersRepository {
  constructor(private prisma: PrismaService) {}
  async create(
    name: string,
    memberFunction: string,
  ): Promise<CreateTeamMemberResponse> {
    const id = randomUUID();
    const existingMember = await this.prisma.rocketTeamMember.findFirst({
      where: {
        name: name,
      },
    });
    if (existingMember) {
      throw new Error(`O membro com o nome "${name}" já existe.`);
    }
    const createdMember = await this.prisma.rocketTeamMember.create({
      data: {
        id,
        name,
        function: memberFunction,
      },
    });

    return {
      id: createdMember.id,
      name: createdMember.name,
      function: createdMember.function,
    };
  }
}

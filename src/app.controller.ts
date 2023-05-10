import { Body, Controller, Post } from '@nestjs/common';
import { CreateTeamMemberBody } from './dtos/create-team-member-body';
import { RocketMembersRepository } from './repositories/rocket-members-repository';

@Controller()
export class AppController {
  constructor(private rocketMembersRepository: RocketMembersRepository) {}

  @Post('create')
  async getMember(@Body() body: CreateTeamMemberBody) {
    const { name, function: memberFunction } = body;
    const created = await this.rocketMembersRepository.create(
      name,
      memberFunction,
    );
    return created;
  }
}

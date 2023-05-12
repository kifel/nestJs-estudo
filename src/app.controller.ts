import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTeamMemberBody } from './dtos/create-team-member-body.dto';
import { RocketMembersRepository } from './repositories/rocket-members-repository';

@ApiTags('User')
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

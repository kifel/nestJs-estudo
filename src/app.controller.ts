import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { CreateTeamMemberBody } from './dtos/create-team-member-body.dto';
import { RocketMembersRepository } from './repositories/rocket-members-repository';

@ApiTags('User')
@Controller()
export class AppController {
  constructor(private rocketMembersRepository: RocketMembersRepository) {}

  @Post('create')
  @ApiConflictResponse({
    description: 'Conflito ao criar usuário',
    schema: {
      example: {
        statusCode: 409,
        message: `O membro com o nome 'userName' já existe.`,
        error: 'Conflict',
      },
    },
  })
  async getMember(@Body() body: CreateTeamMemberBody) {
    const { name, function: memberFunction } = body;
    try {
      const created = await this.rocketMembersRepository.create(
        name,
        memberFunction,
      );
      return created;
    } catch (err) {
      throw new ConflictException(err.message);
    }
  }
}

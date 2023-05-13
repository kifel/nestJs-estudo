import { Body, Controller, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { UserRequest } from 'src/dtos/user-request.dto';
import { UserRepository } from 'src/repositories/user-repository';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

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
  async create(@Body() newUser: UserRequest) {
    return await this.userRepository.create(newUser);
  }
}

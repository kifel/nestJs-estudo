import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { IsPublic } from 'src/config/decorators/is-public.decorator';
import { Roles } from 'src/config/decorators/roles.decorator';
import { UserRequest } from 'src/dtos/user-request.dto';
import { UserRole } from 'src/enums/UserRole';
import { UserFromJwt } from 'src/models/user-from-jwt';
import { UserRepository } from 'src/repositories/user-repository';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  /*
   * Retornar usuário logado pelo token
   */
  @Roles(UserRole.Admin, UserRole.User)
  @Get('me')
  @ApiOperation({
    summary: 'Dados do usuário logado',
  })
  @ApiBearerAuth()
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too Many Requests',
        remaining: 0,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Sem autorização',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Sem permissão',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario não encontado.',
    schema: {
      example: {
        statusCode: 404,
        message: `Usuario não encontado.`,
        error: 'Not Found',
      },
    },
  })
  async getMe(@CurrentUser() user: UserFromJwt) {
    return this.userRepository.findById(user.id);
  }

  /*
   * Cadastro de usuário no banco de dados, deve ser passar pado um json valido para a requisição, nome e email deve ser único e nãs nulos, sendo o email um valido, o password deve ser forte.
   */
  @IsPublic()
  @Post('create')
  @ApiOperation({
    summary: 'Cadastro de novo usuário',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too Many Requests',
        remaining: 0,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Erro no json/Request',
    schema: {
      example: {
        statusCode: 400,
        message: ['Error...', 'Error...'],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Erro ao verificar Roles no banco',
    schema: {
      example: {
        statusCode: 404,
        message: `Cargo não configurados no banco de dados, por favor contactar o ADMIN do sistema.`,
        error: 'Not Found',
      },
    },
  })
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

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsPublic } from 'src/config/decorators/is-public.decorator';
import { LocalAuthGuard } from 'src/config/guards/local-auth.guard';
import { RefreshTokenRequest } from 'src/dtos/auth.dto';
import { UserRequestLogin } from 'src/dtos/user-request.dto';
import { AuthRequest } from 'src/models/auth-request';
import { AuthRepository } from 'src/repositories/auth-repository';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  /*
   * Login na aplicação, gerar token
   */
  @IsPublic()
  @Post('login')
  @ApiOperation({
    summary: 'Login  do usuário na aplicação',
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
  @ApiUnauthorizedResponse({
    description: 'Sem autorização',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Body() user: UserRequestLogin, @Request() red: AuthRequest) {
    return await this.authRepository.generateToken(red.user);
  }

  /*
   * Refresh token na aplicação, gerar token um novo token para manter o login
   */
  @IsPublic()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
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
  @ApiUnauthorizedResponse({
    description: 'Sem autorização',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() token: RefreshTokenRequest) {
    return await this.authRepository.refreshToken(token);
  }
}

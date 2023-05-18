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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/config/decorators/current-user.decorator';
import { IsPublic } from 'src/config/decorators/is-public.decorator';
import { Roles } from 'src/config/decorators/roles.decorator';
import { LocalAuthGuard } from 'src/config/guards/local-auth.guard';
import {
  RefreshTokenLogOutRequest,
  RefreshTokenRequest,
} from 'src/dtos/auth.dto';
import { UserRequestLogin } from 'src/dtos/user-request.dto';
import { UserRole } from 'src/enums/UserRole';
import { AuthRequest } from 'src/models/auth-request';
import { UserFromJwt } from 'src/models/user-from-jwt';
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

  /*
   * Logout na aplicação, aprecisa está com um token valido e ter o cargo de no minimo usuario
   */
  @Roles(UserRole.Admin, UserRole.User)
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out on this application',
  })
  @ApiOkResponse({
    description: 'Log out is successful',
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
  async logout(
    @CurrentUser() user: UserFromJwt,
    @Body() token: RefreshTokenLogOutRequest,
  ) {
    await this.authRepository.logout(user, token);
    return;
  }
}

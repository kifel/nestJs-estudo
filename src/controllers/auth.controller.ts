import {
  Body,
  Controller,
  Delete,
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
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../config/decorators/current-user.decorator';
import { IsPublic } from '../config/decorators/is-public.decorator';
import { Roles } from '../config/decorators/roles.decorator';
import { LocalAuthGuard } from '../config/guards/local-auth.guard';
import {
  RefreshTokenLogOutRequest,
  RefreshTokenRequest,
} from '../dtos/auth.dto';
import { UserRequestLogin } from '../dtos/user-request.dto';
import { UserRole } from '../enums/UserRole';
import { AuthRequest } from '../models/auth-request';
import { UserFromJwt } from '../models/user-from-jwt';
import { AuthRepository } from '../repositories/auth-repository';

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
    return await this.authRepository.generateToken(
      red.user,
      red.ip,
      red.headers['user-agent'],
    );
  }

  /*
   * Refresh token na aplicação, gerar token um novo token para manter o login
   */
  @IsPublic()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh token',
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
  @Delete('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out on this application',
  })
  @ApiOkResponse({
    description: 'Log out is successful',
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

  /*
   * Logout na aplicação em todos os dispositivos, aprecisa está com um token valido e ter o cargo de no minimo usuario
   */
  @Delete('logout-all')
  @Roles(UserRole.Admin, UserRole.User)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out on all devices',
  })
  @ApiOkResponse({
    description: 'Log out is successful',
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
  async logoutAllDevices(@CurrentUser() user: UserFromJwt) {
    await this.authRepository.logoutAllDevices(user);
  }
}

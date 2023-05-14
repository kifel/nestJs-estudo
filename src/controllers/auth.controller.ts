import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/config/decorators/is-public.decorator';
import { LocalAuthGuard } from 'src/config/guards/local-auth.guard';
import { UserRequestLogin } from 'src/dtos/user-request.dto';
import { AuthRequest } from 'src/models/auth-request';
import { AuthRepository } from 'src/repositories/auth-repository';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Body() user: UserRequestLogin, @Request() red: AuthRequest) {
    return await this.authRepository.login(red.user);
  }
}

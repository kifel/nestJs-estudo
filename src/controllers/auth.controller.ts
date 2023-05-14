import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/config/guards/local-auth.guard';
import { UserRequestLogin } from 'src/dtos/user-request.dto';
import { AuthRepository } from 'src/repositories/auth-repository';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(@Body() user: UserRequestLogin) {
    return 'realizar login';
  }
}

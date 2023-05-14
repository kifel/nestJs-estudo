import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/config/database/prisma.service';
import { UserResponse } from 'src/dtos/user-response.dto';
import { AuthRepository } from 'src/repositories/auth-repository';
import { UserRepository } from 'src/repositories/user-repository';

@Injectable()
export class AuthService implements AuthRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(name: string, password: string): Promise<UserResponse> {
    const existUser = await this.userRepository.findByName(name);

    if (existUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existUser.password,
      );
      if (isPasswordValid) {
        return {
          ...existUser,
          password: undefined,
        };
      }
    }
    throw new UnauthorizedException('Usuário ou senha inválidos.');
  }
}

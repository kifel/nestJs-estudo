import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/config/database/prisma.service';
import { UserResponse, UserResponseLogin } from 'src/dtos/user-response.dto';
import { UserPayload } from 'src/models/user-payload';
import { AuthRepository } from 'src/repositories/auth-repository';
import { UserRepository } from 'src/repositories/user-repository';

@Injectable()
export class AuthService implements AuthRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserResponse): Promise<UserResponseLogin> {
    const payload: UserPayload = {
      sub: user.id,
      name: user.name,
    };
    const jwtToken = this.jwtService.sign(payload);

    const refreshToken = await this.createRefreshTokenToken(user);

    return {
      accessToken: jwtToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * This is an async function that validates a user's name and password, and returns a UserResponse
   * object with the user's information if the validation is successful, or throws an
   * UnauthorizedException if the validation fails.
   * @param {string} name - A string representing the username of the user being validated.
   * @param {string} password - The password parameter is a string that represents the password entered
   * by the user for authentication.
   * @returns The function `validateUser` returns a `Promise` that resolves to a `UserResponse` object if
   * the user is validated successfully, or throws an `UnauthorizedException` if the user is not
   * validated. The `UserResponse` object is a copy of the `existUser` object with the `password`
   * property set to `undefined`.
   */
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

  /**
   * This function creates a refresh token for a user with a 30-day expiry date.
   * @param {UserResponse} user - The `user` parameter is of type `UserResponse`, which is likely an
   * object containing information about a user, such as their ID, name, email, etc. This parameter is
   * used to associate the refresh token with a specific user in the database.
   * @returns a string which is the token generated for the refresh token.
   */
  private async createRefreshTokenToken(user: UserResponse): Promise<string> {
    const agora = new Date();
    const trintaDiasDepois = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token: randomUUID(),
        userId: user.id,
        expiryDate: trintaDiasDepois,
      },
    });
    return refreshToken.token;
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import {
  RefreshTokenDevicesResponse,
  RefreshTokenLogOutRequest,
  RefreshTokenRequest,
} from 'src/dtos/auth.dto';
import { UserResponse, UserResponseLogin } from 'src/dtos/user-response.dto';
import { UserRole } from 'src/enums/UserRole';
import { UserFromJwt } from 'src/models/user-from-jwt';
import { UserPayload } from 'src/models/user-payload';
import { AuthRepository } from 'src/repositories/auth-repository';
import { UserRepository } from 'src/repositories/user-repository';
import * as UAParser from 'ua-parser-js';
import { PrismaService } from '../config/database/prisma.service';

// [x] Melhorar essa classe adicionando o findById, assim que for implementado essa função no user service

/*
 * @Author Kifel
 * The AuthService class provides methods for user authentication, token generation and validation, and
 * device management.
 */
@Injectable()
export class AuthService implements AuthRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * This function returns an array of RefreshTokenDevicesResponse objects for a given user.
   * @param {UserFromJwt} user - The `user` parameter is an object of type `UserFromJwt`, which likely
   * contains information about a user that has been authenticated using JSON Web Tokens (JWT). This
   * object is used to query the database for all refresh tokens associated with the user's ID.
   * @returns The `allDevices` function returns an array of `RefreshTokenDevicesResponse` objects. Each
   * object contains information about a device associated with the user's refresh token, including the
   * user ID, device ID, device information, and user information.
   */
  async allDevices(user: UserFromJwt): Promise<RefreshTokenDevicesResponse[]> {
    const foundRefreshToken = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
      },
    });
    return foundRefreshToken.map((refreshToken) => {
      return {
        userId: refreshToken.userId,
        deviceId: refreshToken.deviceId,
        deviceInfo: refreshToken.deviceInfo,
        userInfo: refreshToken.userInfo,
      };
    });
  }

  /**
   * This function logs out a user from all devices by deleting all their refresh tokens.
   * @param {UserFromJwt} user - The `user` parameter is an object of type `UserFromJwt`, which likely
   * contains information about a user that has been authenticated using JSON Web Tokens (JWT). This
   * object likely contains properties such as `id`, `username`, and `email`, which can be used to
   * identify the user in the
   */
  async logoutAllDevices(user: UserFromJwt): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });
  }

  /**
   * This is an async function that logs out a user by deleting their refresh token from the database.
   * @param {UserFromJwt} user - UserFromJwt is likely an object representing a user that has been
   * authenticated using JSON Web Tokens (JWTs). It probably contains information such as the user's ID and
   * name.
   * @param {RefreshTokenLogOutRequest} token - The `token` parameter is of type
   * `RefreshTokenLogOutRequest` and contains the refresh token that the user wants to log out from.
   * @returns a Promise that resolves to void.
   */
  async logout(
    user: UserFromJwt,
    token: RefreshTokenLogOutRequest,
  ): Promise<void> {
    const foundRefreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: token.refreshToken,
        userId: user.id,
      },
    });
    if (foundRefreshToken) {
      await this.deleteRefreshToken(foundRefreshToken.id);
      return;
    }
    throw new UnauthorizedException('Unauthorized');
  }

  /**
   * This function refreshes a user's access token using their refresh token if it is valid and not
   * expired.
   * @param {RefreshTokenRequest} token - A RefreshTokenRequest object containing the refresh token and
   * user ID.
   * @returns a Promise that resolves to a UserResponseLogin object.
   */
  async refreshToken(token: RefreshTokenRequest): Promise<UserResponseLogin> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: token.refreshToken,
      },
    });
    // Verifica se o token foi encontrado
    if (refreshToken) {
      // Verifica se o token pertence ao usuário que foi informado e se ele esta expirado
      if (refreshToken.userId === token.userId) {
        if (!this.isRefreshTokenExpired(refreshToken)) {
          const user = await this.userRepository.findById(refreshToken.userId);

          return await this.updateToken(user, refreshToken);
        }
        await this.deleteRefreshToken(refreshToken.id);
      }
    }
    throw new UnauthorizedException('Dados inválidos.');
  }

  /**
   * This function updates a refresh token with a new token and expiry date.
   * @param {RefreshToken} refreshToken - The refreshToken parameter is an object that represents a
   * refresh token in the system. It contains properties such as id, deviceId, token, expiryDate, and
   * userId. The function updates the token and expiryDate properties of this object and returns the new
   * token value.
   * @returns a string, which is the new refresh token generated after updating the existing refresh
   * token in the database.
   */
  private async updateRefreshToken(
    refreshToken: RefreshToken,
  ): Promise<string> {
    const agora = new Date();
    const trintaDiasDepois = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const newRefreshToken = await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: {
        id: refreshToken.id,
        deviceId: refreshToken.deviceId,
        token: randomUUID(),
        expiryDate: trintaDiasDepois,
        userId: refreshToken.userId,
      },
    });
    return newRefreshToken.token;
  }

  /**
   * This function deletes a refresh token from the database using its ID.
   * @param {number} id - The id parameter is a number that represents the unique identifier of the
   * refresh token that needs to be deleted.
   */
  private async deleteRefreshToken(id: number) {
    await this.prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }

  /**
   * This function checks if a refresh token has expired.
   * @param {RefreshToken} refreshToken - RefreshToken is an object that contains information about a
   * refresh token, including its expiry date.
   * @returns a boolean value indicating whether the refresh token has expired or not. If the current
   * date and time is greater than the expiry date of the refresh token, then it is considered expired
   * and the function returns true. Otherwise, it returns false.
   */
  private isRefreshTokenExpired(refreshToken: RefreshToken): boolean {
    const currentDateTime = new Date();
    const expiryDate = new Date(refreshToken.expiryDate);

    return currentDateTime > expiryDate;
  }

  /**
   * This function generates a JWT token and a refresh token for a user given their information.
   * @param {UserResponse} user - A UserResponse object that contains information about the user, such as
   * their ID and name.
   * @param {string} ip - The IP address of the device making the request.
   * @param {string} deviceInfo - The `deviceInfo` parameter is a string that contains information about
   * the device used by the user to access the application. This information can include the device type,
   * operating system, browser, and other relevant details. The `generateToken` function uses this
   * information to create a unique user agent string that is
   * @returns The function `generateToken` returns a Promise that resolves to an object of type
   * `UserResponseLogin`, which contains an access token and a refresh token.
   */
  async generateToken(
    user: UserResponse,
    ip: string,
    deviceInfo: string,
  ): Promise<UserResponseLogin> {
    const payload: UserPayload = {
      sub: user.id,
      name: user.name,
    };
    const jwtToken = this.jwtService.sign(payload);
    const userAgent = this.parseDeviceInfo(deviceInfo);

    const refreshToken = await this.createRefreshToken(user, ip, userAgent);

    return {
      accessToken: jwtToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * This function updates the access and refresh tokens for a user.
   * @param {UserResponse} user - UserResponse is an object that contains information about the user,
   * such as their ID and name.
   * @param {RefreshToken} refreshToken - The refreshToken parameter is an object that represents the
   * refresh token used to obtain a new access token for a user. It likely contains information such as
   * the token value, expiration date, and user ID associated with the token.
   * @returns An object with two properties: `accessToken` and `refreshToken`. The `accessToken` is a
   * JSON Web Token (JWT) signed with a payload containing the user's ID and name. The `refreshToken`
   * is a new refresh token generated by calling the `updateRefreshToken` method with the existing
   * refresh token.
   */
  private async updateToken(user: UserResponse, refreshToken: RefreshToken) {
    const payload: UserPayload = {
      sub: user.id,
      name: user.name,
    };

    const jwtToken = this.jwtService.sign(payload);

    const newRefreshToken = await this.updateRefreshToken(refreshToken);

    return {
      accessToken: jwtToken,
      refreshToken: newRefreshToken,
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
   * This function creates a refresh token for a user with a specified expiry date, device information,
   * and user information.
   * @param {UserResponse} user - A UserResponse object that contains information about the user for whom
   * the refresh token is being created.
   * @param {string} ip - The IP address of the device making the request.
   * @param {string} deviceInfo - A string that contains information about the device used to generate
   * the refresh token. This could include details such as the device type, operating system, browser,
   * etc.
   * @returns a string, which is the refresh token generated for the user.
   */
  private async createRefreshToken(
    user: UserResponse,
    ip: string,
    deviceInfo: string,
  ): Promise<string> {
    const agora = new Date();
    const trintaDiasDepois = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token: randomUUID(),
        userId: user.id,
        expiryDate: trintaDiasDepois,
        deviceInfo: deviceInfo,
        userInfo: ip,
      },
    });
    return refreshToken.token;
  }

  /**
   * This function validates if a user has the required roles by checking their roles against a list of
   * required roles.
   * @param {UserFromJwt} user - The user object containing information about the user obtained from a
   * JWT (JSON Web Token).
   * @param {UserRole[]} requiredRoles - An array of UserRole enums representing the roles that the
   * user must have in order to pass the validation.
   * @returns A boolean value indicating whether the user has any of the required roles or not.
   */
  async validateRoles(
    user: UserFromJwt,
    requiredRoles: UserRole[],
  ): Promise<boolean> {
    const userLogged = await this.userRepository.findById(user.id);
    if (!userLogged) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const roles = userLogged.roles.map((role) => role.name);

    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      roles.includes(requiredRole),
    );

    return hasRequiredRole;
  }

  /**
   * The function parses device information from a user agent string and returns a string with the device
   * type, model, vendor, and current time.
   * @param {string} userAgent - The `userAgent` parameter is a string that represents the user agent of
   * a web browser or other HTTP client. It typically includes information about the client's operating
   * system, browser, and device.
   * @returns a string that includes the device information parsed from the user agent string and the
   * current time in a specific format.
   */
  private parseDeviceInfo(userAgent: string): string {
    const parser = new UAParser();
    const result = parser.setUA(userAgent).getResult();

    const deviceInfoParts = [];

    if (result.device) {
      if (result.device.type) {
        deviceInfoParts.push(result.device.type);
      }

      if (result.device.model) {
        deviceInfoParts.push(result.device.model);
      }

      if (result.device.vendor) {
        deviceInfoParts.push(result.device.vendor);
      }
    }

    if (deviceInfoParts.length === 0 && result.browser && result.browser.name) {
      deviceInfoParts.push(result.browser.name);
    }

    const deviceInfo =
      deviceInfoParts.length > 0 ? deviceInfoParts.join(' - ') : 'Unknown';

    return `Device: ${deviceInfo} - Current Time: ${new Date().toLocaleString()}`;
  }
}

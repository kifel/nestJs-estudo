import {
  RefreshTokenLogOutRequest,
  RefreshTokenRequest,
} from 'src/dtos/auth.dto';
import { UserResponse, UserResponseLogin } from '../dtos/user-response.dto';
import { UserRole } from '../enums/UserRole';
import { UserFromJwt } from '../models/user-from-jwt';

export abstract class AuthRepository {
  abstract validateUser(name: string, password: string): Promise<UserResponse>;
  abstract generateToken(
    user: UserResponse,
    ip: string,
    deviceInfo: string,
  ): Promise<UserResponseLogin>;
  abstract validateRoles(
    user: UserFromJwt,
    requiredRoles: UserRole[],
  ): Promise<boolean>;
  abstract refreshToken(token: RefreshTokenRequest): Promise<UserResponseLogin>;
  abstract logout(
    user: UserFromJwt,
    token: RefreshTokenLogOutRequest,
  ): Promise<void>;
  abstract logoutAllDevices(user: UserFromJwt): Promise<void>;
}

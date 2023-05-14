import { UserResponse, UserResponseLogin } from 'src/dtos/user-response.dto';
import { UserRole } from 'src/enums/UserRole';
import { UserFromJwt } from 'src/models/user-from-jwt';

export abstract class AuthRepository {
  abstract validateUser(name: string, password: string): Promise<UserResponse>;
  abstract login(user: UserResponse): Promise<UserResponseLogin>;
  abstract validateRoles(
    user: UserFromJwt,
    requiredRoles: UserRole[],
  ): Promise<boolean>;
}

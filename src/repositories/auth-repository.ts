import { UserResponse, UserResponseLogin } from 'src/dtos/user-response.dto';

export abstract class AuthRepository {
  abstract validateUser(name: string, password: string): Promise<UserResponse>;
  abstract login(user: UserResponse): Promise<UserResponseLogin>;
}

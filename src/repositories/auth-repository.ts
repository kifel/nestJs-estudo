import { UserResponse } from 'src/dtos/user-response.dto';

export abstract class AuthRepository {
  abstract validateUser(name: string, password: string): Promise<UserResponse>;
}

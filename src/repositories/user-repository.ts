import { UserRequest } from 'src/dtos/user-request.dto';
import { UserResponse } from 'src/dtos/user-response.dto';

export abstract class UserRepository {
  abstract create(newUser: UserRequest): Promise<UserResponse>;
}

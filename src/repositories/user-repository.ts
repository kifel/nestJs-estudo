import { UserRequest } from '../dtos/user-request.dto';
import { UserResponse } from '../dtos/user-response.dto';

export abstract class UserRepository {
  abstract create(newUser: UserRequest): Promise<UserResponse>;
  abstract findByName(name: string): Promise<any>;
  abstract findById(id: number): Promise<UserResponse>;
}

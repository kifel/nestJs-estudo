import { Request } from 'express';
import { UserResponse } from '../dtos/user-response.dto';

export interface AuthRequest extends Request {
  user: UserResponse;
}

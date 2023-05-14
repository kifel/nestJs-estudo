import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthRepository } from 'src/repositories/auth-repository';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository: AuthRepository) {
    super({ usernameField: 'name' });
  }

  validate(name: string, password: string) {
    return this.authRepository.validateUser(name, password);
  }
}
